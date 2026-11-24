import hashlib
import hmac
import logging
import time
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from postgrest.exceptions import APIError

from app.config import get_settings
from app.database import db, get_lead, now_iso, signed_url, update_lead
from app.models.schemas import ItineraryJSON, PaymentLinkOut, PaymentLinkRequest
from app.security import RateLimiter, check_admin_key
from app.services import notifier, pdf_generator, rag_loader

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["payments"])

RZP_LINKS = "https://api.razorpay.com/v1/payment_links"
LINK_TTL_S = 7 * 24 * 3600
MAX_WEBHOOK_BYTES = 1_000_000
STALE_PENDING = timedelta(minutes=10)  # a row that never got its Razorpay link (crash between insert and call)
_pay_limit = RateLimiter(limit=10, window_s=3600)


def verify_signature(body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected.encode(), (signature or "").encode())


def amount_paise(kind: str, lead: dict, blueprint_id: str | None) -> int:
    """Server-side pricing. The client never sends an amount."""
    s = get_settings()
    if kind == "blueprint":
        bp = rag_loader.BLUEPRINTS.get(blueprint_id or "")
        if not bp:
            raise HTTPException(status_code=422, detail="Unknown blueprint_id")
        return bp["price_inr"] * 100
    if kind == "custom_plan":
        return s.custom_plan_price_inr * 100
    if not lead.get("quote_total_paise"):  # advance
        raise HTTPException(status_code=409, detail="No quote saved for this lead yet")
    return lead["quote_total_paise"] * s.advance_pct // 100


def _ts(s: str | None) -> datetime | None:
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00")) if s else None
    except ValueError:
        return None


def _reusable(row: dict, paise: int, blueprint_id: str | None) -> bool:
    """An open link is handed out again only if it is for exactly this product, at this price, with time left to pay."""
    exp = _ts(row.get("expire_at"))
    return (row["amount_paise"] == paise and row.get("blueprint_id") == blueprint_id
            and (exp is None or exp > datetime.now(timezone.utc) + timedelta(hours=1)))


async def _retire(row: dict) -> None:
    """Close an open payment row so a fresh link can be issued, and cancel it at Razorpay so it is not paid by accident.
    If it is paid anyway the webhook still matches it (see razorpay_webhook) and the customer still gets what they bought."""
    await db().table("payments").update({"status": "expired"}).eq("id", row["id"]).in_("status", ["pending", "created"]).execute()
    if not row.get("rp_link_id"):
        return
    s = get_settings()
    try:
        r = await notifier.get_http().post(f"{RZP_LINKS}/{row['rp_link_id']}/cancel",
                                           auth=(s.razorpay_key_id, s.razorpay_key_secret.get_secret_value()))
        r.raise_for_status()
    except Exception as e:  # noqa: BLE001
        log.warning("could not cancel old razorpay link: %s", type(e).__name__)
        await notifier.notify_admin(f"<b>Could not cancel old payment link</b> {notifier.esc(row['rp_link_id'])}. "
                                    "Cancel it in the Razorpay dashboard. If it gets paid it will still be matched and delivered.")


@router.post("/create-payment-link", response_model=PaymentLinkOut, dependencies=[Depends(_pay_limit)])
async def create_payment_link(body: PaymentLinkRequest, request: Request):
    if body.kind == "advance":  # custom quotes are agency-approved: admin only
        check_admin_key(request.headers.get("X-Admin-Key"))
    lead = await get_lead(body.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Not found")
    if body.kind == "custom_plan":
        if lead["service"] == "blueprint":
            raise HTTPException(status_code=400, detail="Lead did not request a custom plan")
        has_plan = await db().table("itineraries").select("id").eq("lead_id", str(body.lead_id)).limit(1).execute()
        if not has_plan.data:  # never take money for a plan that does not exist yet
            raise HTTPException(status_code=409, detail="Your preview isn't ready yet")

    s = get_settings()
    paise = amount_paise(body.kind, lead, body.blueprint_id)
    expire_by = int(time.time()) + LINK_TTL_S

    ins = None
    for _ in range(3):
        try:
            ins = await db().table("payments").insert({
                "lead_id": str(body.lead_id), "kind": body.kind, "blueprint_id": body.blueprint_id,
                "amount_paise": paise, "status": "pending",
            }).execute()
            break
        except APIError as e:
            if e.code != "23505":  # unique violation = an open link already exists for this lead and kind
                raise
            ex = await (db().table("payments").select("id,short_url,amount_paise,blueprint_id,expire_at,rp_link_id,created_at")
                        .eq("lead_id", str(body.lead_id)).eq("kind", body.kind).in_("status", ["pending", "created"]).limit(1).execute())
            row = ex.data[0] if ex.data else None
            if row is None:
                continue  # it closed between our insert and our read: try again
            if not row["short_url"]:
                made = _ts(row.get("created_at"))
                if made and datetime.now(timezone.utc) - made > STALE_PENDING:
                    await _retire(row)  # a crashed attempt must not block this lead forever
                    continue
                raise HTTPException(status_code=409, detail="Payment link is being created, retry in a few seconds") from e
            if _reusable(row, paise, body.blueprint_id):
                return PaymentLinkOut(payment_url=row["short_url"], amount_inr=row["amount_paise"] // 100)
            await _retire(row)  # expired, re-quoted, or a different blueprint: replace it instead of returning the wrong link
    if ins is None:
        raise HTTPException(status_code=409, detail="Could not open a payment link, please retry")
    pay_id = ins.data[0]["id"]

    payload = {
        "amount": paise, "currency": "INR", "accept_partial": False,
        "reference_id": pay_id,
        "description": f"{s.brand_name}: {body.kind.replace('_', ' ')}",
        "expire_by": expire_by, "reminder_enable": False,
        "notify": {"sms": False, "email": False},  # no customer PII shared with Razorpay
        "notes": {"lead_id": str(body.lead_id), "kind": body.kind},
    }
    if s.razorpay_callback_url:
        payload.update(callback_url=s.razorpay_callback_url, callback_method="get")

    try:
        r = await notifier.get_http().post(
            RZP_LINKS, json=payload, auth=(s.razorpay_key_id, s.razorpay_key_secret.get_secret_value()),
        )
        r.raise_for_status()
        link = r.json()
    except Exception as e:  # noqa: BLE001
        log.error("razorpay link creation failed: %s", type(e).__name__)
        await db().table("payments").update({"status": "failed"}).eq("id", pay_id).execute()
        raise HTTPException(status_code=502, detail="Payment provider error") from e

    await db().table("payments").update(
        {"status": "created", "rp_link_id": link["id"], "short_url": link["short_url"],
         "expire_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(expire_by))}
    ).eq("id", pay_id).execute()
    return PaymentLinkOut(payment_url=link["short_url"], amount_inr=paise // 100)


async def fulfill(payment: dict) -> None:
    """Deliver what was paid for. Safe to re-run (admin /fulfill endpoint)."""
    s = get_settings()
    lead = await get_lead(payment["lead_id"])
    kind = payment["kind"]
    try:
        if kind == "advance":
            await notifier.notify_admin(
                f"<b>Advance received</b> ₹{payment['amount_paise'] // 100} · lead <code>{notifier.esc(lead['id'])}</code>. Start bookings.")
            return
        if kind == "custom_plan":
            r = await db().table("itineraries").select("data").eq("lead_id", lead["id"]).limit(1).execute()
            if not r.data:
                await notifier.notify_admin(
                    f"<b>Paid custom plan but NO itinerary</b> lead <code>{notifier.esc(lead['id'])}</code>. Plan manually.")
                return
            pdf = await pdf_generator.render_pdf(ItineraryJSON.model_validate(r.data[0]["data"]), lead, preview=False)
            path = await pdf_generator.store_pdf(lead["id"], "full", pdf)
            await update_lead(lead["id"], full_pdf_path=path)
            url, label = await signed_url(s.storage_bucket, path, LINK_TTL_S), "custom itinerary"
        else:  # blueprint
            bp = rag_loader.BLUEPRINTS[payment["blueprint_id"]]
            url, label = await signed_url(s.blueprint_bucket, bp["file"], LINK_TTL_S), f"blueprint ({bp['destination']})"
        await notifier.notify_admin(notifier.fmt_delivery(lead, label, url))
    except Exception as e:  # noqa: BLE001
        log.exception("fulfilment failed payment=%s", payment["id"])
        await notifier.notify_admin(
            f"<b>Fulfilment FAILED</b> after payment. lead <code>{notifier.esc(payment['lead_id'])}</code> "
            f"({notifier.esc(type(e).__name__)}). Retry: POST /api/admin/leads/&lt;id&gt;/fulfill")


@router.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request, bg: BackgroundTasks):
    raw = await request.body()
    if len(raw) > MAX_WEBHOOK_BYTES:
        raise HTTPException(status_code=413, detail="Payload too large")
    secret = get_settings().razorpay_webhook_secret.get_secret_value()
    if not verify_signature(raw, request.headers.get("X-Razorpay-Signature", ""), secret):
        log.warning("webhook rejected: bad signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        event = await request.json()
        if not isinstance(event, dict):
            raise ValueError("not an object")
        name = event.get("event")
        if name in ("payment_link.expired", "payment_link.cancelled"):
            gone = event["payload"]["payment_link"]["entity"]
            await db().table("payments").update({"status": "expired"}).eq("rp_link_id", gone["id"]).in_("status", ["pending", "created"]).execute()
            return {"status": "expired"}
        if name != "payment_link.paid":
            return {"status": "ignored"}
        link = event["payload"]["payment_link"]["entity"]
        pay = event["payload"].get("payment", {}).get("entity", {})
    except (ValueError, KeyError, TypeError, AttributeError):
        log.warning("webhook: malformed payload")
        return {"status": "ignored"}  # 2xx: retrying a malformed body will never help

    r = await db().table("payments").select("*").eq("rp_link_id", link["id"]).limit(1).execute()
    if not r.data:
        log.warning("webhook: unknown link %s", link["id"])
        await notifier.notify_admin(f"<b>Payment for an unknown link</b> {notifier.esc(link['id'])}. Check the Razorpay dashboard: money may be received but unmatched.")
        return {"status": "unknown_link"}
    payment = r.data[0]

    if int(link.get("amount_paid", 0)) < payment["amount_paise"]:
        await notifier.notify_admin(
            f"<b>Underpayment</b> link {notifier.esc(link['id'])}: paid {link.get('amount_paid')} of {payment['amount_paise']} paise. Not marked paid.")
        return {"status": "underpaid"}

    # Atomic CAS = idempotency: Razorpay retries / duplicate deliveries flip the row only once.
    # 'expired' is allowed: a link we replaced or that expired can still be paid, and that payment is real money.
    was_expired = payment["status"] == "expired"
    won = await (db().table("payments").update({"status": "paid", "rp_payment_id": pay.get("id"), "paid_at": now_iso()})
                 .eq("id", payment["id"]).in_("status", ["pending", "created", "expired"]).execute())
    if not won.data:
        return {"status": "duplicate"}

    bg.add_task(fulfill, payment)  # queue delivery FIRST: if the status write below fails the customer still gets what they paid for
    if was_expired:
        await notifier.notify_admin(f"<b>Paid on a replaced or expired link</b> {notifier.esc(link['id'])} (lead <code>{notifier.esc(payment['lead_id'])}</code>). "
                                    "Delivery is queued; reconcile the amount in Razorpay.")
    try:
        await update_lead(payment["lead_id"], status="paid")
    except Exception:  # noqa: BLE001 - a DB blip must not make Razorpay's retry look like a duplicate with nothing done
        log.exception("could not mark lead paid lead=%s", payment["lead_id"])
        await notifier.notify_admin(f"<b>Paid, but the lead status update failed</b> lead <code>{notifier.esc(payment['lead_id'])}</code>. Delivery is queued; set the status manually.")
    return {"status": "ok"}
