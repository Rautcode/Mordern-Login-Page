import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request

from app.config import get_settings
from app.database import db, get_lead, signed_url
from app.models.schemas import LeadCreate, LeadCreated, LeadStatusOut
from app.security import RateLimiter
from app.services import notifier, turnstile

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["leads"])

_create_limit = RateLimiter(limit=10, window_s=3600)  # per IP
_status_limit = RateLimiter(limit=120, window_s=60)  # polling
_phone_limit = RateLimiter(limit=5, window_s=3600)  # per phone number: nobody's number can be flooded with our messages
_global_limit = RateLimiter(limit=120, window_s=3600)  # whole site: bounds Telegram alerts however many IPs an attacker rotates
RETRY_WINDOW = timedelta(seconds=120)


@router.post("/leads", response_model=LeadCreated, status_code=201, dependencies=[Depends(_create_limit)])
async def create_lead(body: LeadCreate, bg: BackgroundTasks, request: Request):
    if body.website:  # honeypot tripped: pretend success, store nothing
        return LeadCreated(lead_id=uuid4(), whatsapp_url=notifier.agency_wa_link("Hi!"))

    if turnstile.enabled() and not await turnstile.verify(body.turnstile_token, request.client.host if request.client else None):
        raise HTTPException(status_code=403, detail="Verification failed. Please try again, or message us on WhatsApp.")
    # The same person tapping twice or retrying after a timeout gets their existing lead: no second record, no second alert.
    recent = (datetime.now(timezone.utc) - RETRY_WINDOW).isoformat()
    dup = await (db().table("leads").select("id").eq("phone", body.phone).eq("destination", body.destination)
                 .eq("service", body.service).gte("created_at", recent).limit(1).execute())
    if dup.data:
        return LeadCreated(lead_id=dup.data[0]["id"], whatsapp_url=notifier.agency_wa_link("Hi!"))
    if not _phone_limit.allow(body.phone) or not _global_limit.allow("all"):
        raise HTTPException(status_code=429, detail="Too many requests right now. Message us on WhatsApp and we'll pick it up.")

    row = body.model_dump(exclude={"website", "turnstile_token"})
    row["interests"] = ", ".join(row["interests"])  # stored as text
    row = {k: v for k, v in row.items() if v not in (None, "")}  # unanswered optional columns stay NULL (and need no migration until used)
    res = await db().table("leads").insert(row).execute()
    lead = res.data[0]
    log.info("lead created id=%s dest=%s service=%s", lead["id"], lead["destination"], lead["service"])
    bg.add_task(notifier.notify_admin, notifier.fmt_new_lead(lead))

    text = (
        f"Hi! I just submitted a {lead['destination']} trip request on your website "
        f"(ref {str(lead['id'])[:8]})."
    )
    return LeadCreated(lead_id=lead["id"], whatsapp_url=notifier.agency_wa_link(text))


@router.get("/leads/{lead_id}/status", response_model=LeadStatusOut, dependencies=[Depends(_status_limit)])
async def lead_status(lead_id: UUID):
    """Public, but the unguessable UUID is the capability and the response carries no PII."""
    lead = await get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Not found")

    s = get_settings()
    out = LeadStatusOut(status=lead["status"])
    if lead.get("preview_pdf_path"):
        out.preview_url = await signed_url(s.storage_bucket, lead["preview_pdf_path"], 3600)
    if lead["status"] in ("paid", "delivered") and lead.get("full_pdf_path"):
        out.download_url = await signed_url(s.storage_bucket, lead["full_pdf_path"], 3600)

    pay = (
        await db().table("payments").select("short_url").eq("lead_id", str(lead_id))
        .eq("status", "created").limit(1).execute()
    )
    if pay.data:
        out.payment_url = pay.data[0]["short_url"]
    return out
