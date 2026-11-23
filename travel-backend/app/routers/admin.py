import logging
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query

from app.config import get_settings
from app.database import db, get_lead, update_lead
from app.models.schemas import LeadStatus, PricingInput, PricingOutput, StatusUpdate
from app.routers.payments import fulfill
from app.security import require_admin
from app.services import pricing_engine

log = logging.getLogger(__name__)
# ponytail: one shared admin key. Move to JWT/RBAC when a second person needs access or an audit trail.
router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/leads")
async def list_leads(status: LeadStatus | None = None, limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0)):
    q = db().table("leads").select("*").order("created_at", desc=True).range(offset, offset + limit - 1)
    if status:
        q = q.eq("status", status.value)
    return (await q.execute()).data


@router.patch("/leads/{lead_id}/status")
async def set_status(lead_id: UUID, body: StatusUpdate):
    if not await get_lead(lead_id):
        raise HTTPException(status_code=404, detail="Not found")
    await update_lead(lead_id, status=body.status.value)
    log.info("admin set status lead=%s -> %s", lead_id, body.status.value)
    return {"status": body.status}


@router.post("/margin-calc", response_model=PricingOutput)
async def margin_calc(body: PricingInput):
    s = get_settings()
    return pricing_engine.calculate(body, s.gst_rate_pct, s.advance_pct)


@router.post("/leads/{lead_id}/quote", response_model=PricingOutput)
async def save_quote(lead_id: UUID, body: PricingInput):
    """Compute and store the customer-facing quote; the advance payment link is derived from it."""
    if not await get_lead(lead_id):
        raise HTTPException(status_code=404, detail="Not found")
    s = get_settings()
    out = pricing_engine.calculate(body, s.gst_rate_pct, s.advance_pct)
    await update_lead(lead_id, status="quoted", quote_total_paise=out.total * 100, quote_per_person_paise=out.per_person * 100)
    return out


@router.post("/leads/{lead_id}/fulfill", status_code=202)
async def refulfill(lead_id: UUID, bg: BackgroundTasks):
    """Re-run delivery for paid, non-advance payments (e.g. after a failed PDF render)."""
    r = await db().table("payments").select("*").eq("lead_id", str(lead_id)).eq("status", "paid").execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="No paid payment for this lead")
    for p in r.data:
        bg.add_task(fulfill, p)
    return {"queued": len(r.data)}
