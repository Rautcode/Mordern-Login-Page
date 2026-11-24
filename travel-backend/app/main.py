import logging
import os
import time
from contextlib import asynccontextmanager
from uuid import uuid4

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import close_db, db, init_db
from app.routers import admin, console, itineraries, leads, payments, whatsapp
from app.security import check_proxy_trust
from app.services import notifier, pdf_generator, rag_loader

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    cfg = get_settings()  # fail fast on missing/invalid env
    check_proxy_trust(os.environ.get("FORWARDED_ALLOW_IPS"), cfg.is_prod)
    rag_loader.load_all()
    await init_db()
    notifier.init(httpx.AsyncClient(timeout=httpx.Timeout(10.0)))
    await pdf_generator.self_check()
    log.info("startup complete")
    yield
    await notifier.close()
    await close_db()


s = get_settings()
app = FastAPI(
    title="GhumoCo API",
    lifespan=lifespan,
    docs_url=None if s.is_prod else "/docs",
    redoc_url=None,
    openapi_url=None if s.is_prod else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=s.cors_list,  # explicit origins only; no cookies, so no credentials
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type", "X-Admin-Key"],
    max_age=600,
)


@app.middleware("http")
async def access_log(request: Request, call_next):
    rid, t0 = uuid4().hex[:12], time.perf_counter()
    raw_path = request.scope.get("raw_path") or request.url.path.encode()  # logged with %r: a %0a in the URL cannot forge log lines
    try:
        response = await call_next(request)
    except Exception:
        log.exception("unhandled rid=%s %s %r", rid, request.method, raw_path)
        return JSONResponse({"detail": "Internal Server Error"}, status_code=500, headers={"X-Request-ID": rid})
    response.headers["X-Request-ID"] = rid
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    if request.url.path.startswith("/api/"):
        response.headers.setdefault("Cache-Control", "no-store")  # lead data and signed links must not sit in shared caches
    log.info("rid=%s %s %r %s %.0fms", rid, request.method, raw_path, response.status_code,
             (time.perf_counter() - t0) * 1000)
    return response


app.include_router(leads.router)
app.include_router(itineraries.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(console.router)
app.include_router(whatsapp.router)


@app.get("/health", tags=["ops"])
async def health():
    return {"status": "ok"}


@app.get("/ready", tags=["ops"])
async def ready():
    try:
        await db().table("leads").select("id").limit(1).execute()
    except Exception:  # noqa: BLE001
        log.exception("readiness check failed")
        return JSONResponse({"status": "db_unavailable"}, status_code=503)
    return {"status": "ready"}
