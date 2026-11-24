import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.config import get_settings
from app.database import db, get_lead, now_iso, update_lead
from app.models.schemas import GeneratePreviewRequest
from app.security import RateLimiter
from app.services import ai_planner, notifier, pdf_generator, rag_loader

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["itineraries"])

_gen_limit = RateLimiter(limit=5, window_s=3600)  # per IP; each call can cost real Gemini money
STALE_AFTER = timedelta(minutes=10)
MAX_ATTEMPTS_PER_LEAD = 3
_attempts: dict = {"day": None, "n": 0, "per_lead": {}}


def _reserve_attempt(lead_id) -> str | None:
    """Count every Gemini run, failures included (each can make several paid calls). Synchronous, so atomic on the event loop.
    Returns None if reserved, else 'cap' (daily budget spent) or 'lead' (this request keeps failing).
    ponytail: per process and reset on restart; the DB-backed success count in _daily_cap_reached covers restarts."""
    today = datetime.now(timezone.utc).date()
    if _attempts["day"] != today:
        _attempts.update(day=today, n=0, per_lead={})
    key = str(lead_id)
    if _attempts["n"] >= get_settings().max_daily_generations:
        return "cap"
    if _attempts["per_lead"].get(key, 0) >= MAX_ATTEMPTS_PER_LEAD:
        return "lead"
    _attempts["n"] += 1
    _attempts["per_lead"][key] = _attempts["per_lead"].get(key, 0) + 1
    return None


def _refund_attempt(lead_id) -> None:
    _attempts["n"] = max(0, _attempts["n"] - 1)
    _attempts["per_lead"][str(lead_id)] = max(0, _attempts["per_lead"].get(str(lead_id), 1) - 1)


async def _finish(lead_id, **fields) -> None:
    """The background job may only move a lead that is still 'generating': a payment or manual change that landed
    meanwhile must not be overwritten (it used to flip a paid lead back to preview_ready)."""
    fields["updated_at"] = now_iso()
    await db().table("leads").update(fields).eq("id", str(lead_id)).eq("status", "generating").execute()


@router.get("/blueprints")
async def list_blueprints():
    return [{"id": k, "title": v["title"], "destination": v["destination"], "price_inr": v["price_inr"]}
            for k, v in rag_loader.BLUEPRINTS.items()]


async def _claim(lead_id: UUID) -> bool:
    """Atomic compare-and-set so two requests can't both start generation for one lead."""
    cutoff = (datetime.now(timezone.utc) - STALE_AFTER).isoformat()
    # A job lost to a restart stays 'generating' forever: recover it once it is stale.
    await (db().table("leads").update({"status": "failed"}).eq("id", str(lead_id))
           .eq("status", "generating").lt("updated_at", cutoff).execute())
    r = await (db().table("leads").update({"status": "generating", "updated_at": now_iso()})
               .eq("id", str(lead_id)).in_("status", ["new", "failed"]).execute())
    return bool(r.data)


async def _daily_cap_reached() -> bool:
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    r = await db().table("itineraries").select("id", count="exact").gte("created_at", start).limit(1).execute()
    return (r.count or 0) >= get_settings().max_daily_generations


async def _run_generation(lead: dict) -> None:
    lead_id = lead["id"]
    try:
        kb = rag_loader.get_context(lead["destination"])
        itin, usage = await ai_planner.generate_itinerary(lead, kb)
        await db().table("itineraries").upsert(
            {"lead_id": lead_id, "data": itin.model_dump(), "model": get_settings().gemini_model,
             "tokens_in": usage["in"], "tokens_out": usage["out"]},
            on_conflict="lead_id",
        ).execute()
        pdf = await pdf_generator.render_pdf(itin, lead, preview=True)
        path = await pdf_generator.store_pdf(lead_id, "preview", pdf)
        await _finish(lead_id, status="preview_ready", preview_pdf_path=path)
        await notifier.notify_admin(f"<b>Preview ready</b> for lead <code>{notifier.esc(lead_id)}</code>")
    except Exception as e:  # noqa: BLE001 - background task: record, alert, never crash silently
        log.exception("generation failed lead=%s", lead_id)
        await _finish(lead_id, status="failed")
        await notifier.notify_admin(
            f"<b>Generation FAILED</b> lead <code>{notifier.esc(lead_id)}</code>: {notifier.esc(type(e).__name__)}. Plan manually or retry."
        )


@router.post("/generate-preview", status_code=202, dependencies=[Depends(_gen_limit)])
async def generate_preview(body: GeneratePreviewRequest, bg: BackgroundTasks):
    lead = await get_lead(body.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Not found")
    if lead["service"] == "blueprint":
        raise HTTPException(status_code=400, detail="Blueprints are purchased, not generated")
    if lead["status"] in ("preview_ready", "paid", "delivered"):
        return {"status": lead["status"]}  # idempotent
    if lead["status"] in ("needs_manual", "quoted", "lost"):
        return {"status": lead["status"]}  # nothing to generate; don't make the site poll for a plan that is not coming

    if rag_loader.get_context(lead["destination"]) is None:
        # No verified data = no AI freestyle. A human plans these.
        await update_lead(lead["id"], status="needs_manual")
        await notifier.notify_admin(
            f"<b>Manual plan needed</b> ({notifier.esc(lead['destination'])}) lead <code>{notifier.esc(lead['id'])}</code>"
        )
        return {"status": "needs_manual"}

    if await _daily_cap_reached():
        log.error("daily generation cap reached")
        raise HTTPException(status_code=503, detail="Busy right now, we'll WhatsApp you your plan.")

    verdict = _reserve_attempt(body.lead_id)
    if verdict == "cap":
        log.error("daily generation cap reached (attempts)")
        raise HTTPException(status_code=503, detail="Busy right now, we'll WhatsApp you your plan.")
    if verdict == "lead":
        await update_lead(lead["id"], status="needs_manual")
        await notifier.notify_admin(f"<b>Manual plan needed</b>: generation keeps failing for lead <code>{notifier.esc(lead['id'])}</code>")
        return {"status": "needs_manual"}
    if not await _claim(body.lead_id):
        _refund_attempt(body.lead_id)
        return {"status": "generating"}
    # ponytail: FastAPI BackgroundTasks run in-process; a restart loses the job (the stale-claim
    # recovery above makes it retryable). Move to a real queue (arq / Cloud Tasks) at volume.
    bg.add_task(_run_generation, lead)
    return {"status": "generating"}
