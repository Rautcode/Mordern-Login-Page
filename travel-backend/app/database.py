"""Supabase (Postgres + Storage) access. Service-role key: server-side only."""
import logging
from datetime import datetime, timezone
from uuid import UUID

from supabase import AsyncClient, acreate_client

from app.config import get_settings

log = logging.getLogger(__name__)
_client: AsyncClient | None = None


async def init_db() -> None:
    global _client
    s = get_settings()
    _client = await acreate_client(s.supabase_url, s.supabase_service_key.get_secret_value())


async def close_db() -> None:
    global _client
    _client = None


def db() -> AsyncClient:
    if _client is None:
        raise RuntimeError("Database not initialised")
    return _client


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ponytail: .limit(1) + data[0] instead of maybe_single(), whose "no row" behaviour differs across supabase-py versions.
async def get_lead(lead_id: UUID | str) -> dict | None:
    r = await db().table("leads").select("*").eq("id", str(lead_id)).limit(1).execute()
    return r.data[0] if r.data else None


async def update_lead(lead_id: UUID | str, **fields) -> None:
    fields["updated_at"] = now_iso()
    await db().table("leads").update(fields).eq("id", str(lead_id)).execute()


# ---- Storage (private buckets; we store paths, never URLs, and sign on demand) ----
async def upload_pdf(bucket: str, path: str, data: bytes) -> None:
    await db().storage.from_(bucket).upload(
        path, data, {"content-type": "application/pdf", "upsert": "true"}
    )


async def signed_url(bucket: str, path: str, ttl_s: int) -> str:
    res = await db().storage.from_(bucket).create_signed_url(path, ttl_s)
    url = res.get("signedURL") or res.get("signedUrl")  # key name differs across storage3 versions
    if not url:
        raise RuntimeError("Supabase returned no signed URL")
    if not url.startswith("http"):
        url = f"{get_settings().supabase_url.rstrip('/')}/storage/v1{url}"
    return url
