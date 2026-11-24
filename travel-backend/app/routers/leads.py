import logging
from uuid import UUID, uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.config import get_settings
from app.database import db, get_lead, signed_url
from app.models.schemas import LeadCreate, LeadCreated, LeadStatusOut
from app.security import RateLimiter
from app.services import notifier

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["leads"])

_create_limit = RateLimiter(limit=10, window_s=3600)  # per IP
_status_limit = RateLimiter(limit=120, window_s=60)  # polling


@router.post("/leads", response_model=LeadCreated, status_code=201, dependencies=[Depends(_create_limit)])
async def create_lead(body: LeadCreate, bg: BackgroundTasks):
    if body.website:  # honeypot tripped: pretend success, store nothing
        return LeadCreated(lead_id=uuid4(), whatsapp_url=notifier.agency_wa_link("Hi!"))

    row = body.model_dump(exclude={"website"})
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
