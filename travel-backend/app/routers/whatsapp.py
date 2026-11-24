"""Inbound WhatsApp (Cloud API webhook). The customer messages first (the website's "Send on WhatsApp" button), which opens
Meta's 24-hour window for free-form replies. We acknowledge, attach the free Day 1 preview when it exists, and alert the owner.
Anything unclear, or anything sensitive, goes to a human; no model writes to customers.
"""
import hmac
import json
import logging
import re
import time
from collections import OrderedDict

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse

from app.config import get_settings
from app.database import db, signed_url
from app.security import RateLimiter
from app.services import notifier, whatsapp

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["whatsapp"])

MAX_BODY = 256_000
DAY = 24 * 3600
REF = re.compile(r"\bref[:\s]+([0-9a-f]{8})\b", re.I)   # the website's WhatsApp message carries "Ref: xxxxxxxx" (first 8 characters of the lead id); the API's own link says "(ref xxxxxxxx)"
HUMAN = re.compile(r"refund|cancel|complain|medical|doctor|senior|elderly|wheelchair|emergency|urgent|disabled|pregnan|human|agent|call me|speak to|talk to", re.I)

# ponytail: all state below is per process and resets on restart. Worst case after a restart: one extra auto-reply, or a
# retried webhook answered twice. Move to a table if you run several instances.
_seen: OrderedDict[str, None] = OrderedDict()   # message ids already handled (Meta retries deliveries)
_replied: dict[str, float] = {}                  # sender -> time of our last automatic reply
_paused: dict[str, float] = {}                   # sender -> time a human was asked for: no automatic replies for 24 h
_alert_limit = RateLimiter(limit=5, window_s=3600)   # per sender: one chatty number cannot flood the owner's Telegram


def _fresh(d: dict[str, float], key: str) -> bool:
    t = d.get(key)
    if t is not None and time.monotonic() - t < DAY:
        return True
    d.pop(key, None)
    if len(d) > 5000:   # bound memory
        for k in [k for k, v in d.items() if time.monotonic() - v >= DAY]:
            d.pop(k, None)
    return False


def _first_seen(msg_id: str) -> bool:
    if msg_id in _seen:
        return False
    _seen[msg_id] = None
    while len(_seen) > 5000:
        _seen.popitem(last=False)
    return True


@router.get("/webhooks/whatsapp")
async def verify(mode: str = Query("", alias="hub.mode"), token: str = Query("", alias="hub.verify_token"),
                 challenge: str = Query("", alias="hub.challenge")):
    """Meta's one-time handshake when you save the webhook URL."""
    if not whatsapp.enabled():
        raise HTTPException(status_code=404, detail="Not found")
    want = get_settings().whatsapp_verify_token.get_secret_value()
    if mode == "subscribe" and hmac.compare_digest(token.encode(), want.encode()):
        return PlainTextResponse(challenge[:200])
    raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/webhooks/whatsapp")
async def receive(request: Request, bg: BackgroundTasks):
    if not whatsapp.enabled():
        raise HTTPException(status_code=404, detail="Not found")
    body = await request.body()
    if len(body) > MAX_BODY or not whatsapp.verify_signature(
            body, request.headers.get("X-Hub-Signature-256"), get_settings().whatsapp_app_secret.get_secret_value()):
        raise HTTPException(status_code=403, detail="Forbidden")   # forged or tampered: nothing is parsed
    try:
        payload = json.loads(body)
    except ValueError:
        return {"ok": True}   # signed but not JSON: acknowledge so Meta does not retry it
    for m in whatsapp.parse_inbound(payload if isinstance(payload, dict) else {}):
        if _first_seen(m.id):
            bg.add_task(handle, m)
    return {"ok": True}   # always 200 fast, or Meta retries


async def find_lead(ref: str) -> dict | None:
    """Lead ids are UUIDs: an 8-hex prefix is a contiguous range. Two matches (rare) count as no match."""
    r = await (db().table("leads").select("*").gte("id", f"{ref.lower()}-0000-0000-0000-000000000000")
               .lte("id", f"{ref.lower()}-ffff-ffff-ffff-ffffffffffff").limit(2).execute())
    return r.data[0] if len(r.data) == 1 else None


def _site() -> str:
    origins = get_settings().cors_list
    return origins[0] if origins else ""


async def _alert(m: whatsapp.Inbound, headline: str, lead: dict | None = None) -> None:
    if not _alert_limit.allow(m.sender):
        return
    who = f"{notifier.esc(lead['name'])} · " if lead else ""
    await notifier.notify_admin(
        f"<b>{notifier.esc(headline)}</b>\n{who}+{notifier.esc(m.sender)}\n{notifier.esc(m.text[:300])}\n"
        f'<a href="https://wa.me/{notifier.esc(m.sender)}">Reply on WhatsApp</a> (free-form replies work for 24 h after their message)'
        + (f"\n<code>{notifier.esc(lead['id'])}</code>" if lead else ""))


async def handle(m: whatsapp.Inbound) -> None:
    """Never raises: this runs in a background task and Meta has already been answered."""
    try:
        s = get_settings()
        if HUMAN.search(m.text) or m.text.startswith("["):   # sensitive topic, or media we cannot read
            _paused[m.sender] = time.monotonic()
            if not _fresh(_replied, m.sender):
                _replied[m.sender] = time.monotonic()
                await whatsapp.send_text(m.sender, "Thanks for your message. A person will reply to you personally within 24 hours.")
            await _alert(m, "Needs a person")
            return
        if _fresh(_paused, m.sender):   # a human was asked for: stay quiet, just tell the owner
            await _alert(m, "New message (bot paused)")
            return

        ref = REF.search(m.text)
        lead = await find_lead(ref.group(1)) if ref else None
        if lead and lead["phone"] == m.sender:   # the sender must own the lead: a guessed ref must never unlock someone's plan
            first = (lead["name"].split() or [""])[0]
            await whatsapp.send_text(m.sender, f"Hi {first}! Thanks for your {lead['destination']} trip request. "
                                     "A person will message you here within 24 hours with your plan and quote.")
            if lead.get("preview_pdf_path"):
                try:
                    url = await signed_url(s.storage_bucket, lead["preview_pdf_path"], 3600)
                    await whatsapp.send_document(m.sender, url, "day-1-preview.pdf", "Your free Day 1 preview. This is a sample of your plan, not a quote.")
                except Exception as e:  # noqa: BLE001
                    log.warning("preview attach failed: %s", type(e).__name__)
            _replied[m.sender] = time.monotonic()
            await _alert(m, "Customer opened WhatsApp", lead)
            return

        if not _fresh(_replied, m.sender):   # at most one automatic reply per sender per day
            _replied[m.sender] = time.monotonic()
            link = f" Fastest way: tell us the trip at {_site()}/#planner (about 2 minutes)." if _site() else ""
            await whatsapp.send_text(m.sender, f"Hi! Thanks for messaging {s.brand_name}.{link} Or reply with your destination, dates, "
                                     "number of travellers and budget, and a person will reply within 24 hours.")
        await _alert(m, "New WhatsApp message", lead if (lead and lead["phone"] == m.sender) else None)
    except Exception:  # noqa: BLE001
        log.exception("whatsapp handler failed")
