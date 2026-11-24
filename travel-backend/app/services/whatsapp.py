"""WhatsApp Cloud API (Meta): verify and parse inbound webhooks, send replies.

Deliberately no LLM: the website already collects structured details, and a model answering customers could invent
prices or inclusions. Every reply here is a fixed template filled from our own lead record.
"""
import hashlib
import hmac
import logging
from dataclasses import dataclass

import httpx

from app.config import get_settings
from app.services import notifier

log = logging.getLogger(__name__)


def enabled() -> bool:
    s = get_settings()
    return bool(s.whatsapp_app_secret and s.whatsapp_app_secret.get_secret_value() and s.whatsapp_access_token
                and s.whatsapp_phone_number_id and s.whatsapp_verify_token)


def verify_signature(body: bytes, header: str | None, secret: str) -> bool:
    """Meta signs the raw body with the app secret: X-Hub-Signature-256: sha256=<hex>."""
    if not header or not header.startswith("sha256="):
        return False
    want = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(want, header[7:])


@dataclass(frozen=True)
class Inbound:
    id: str
    sender: str   # digits with country code, the same shape as leads.phone
    text: str     # non-text messages become "[image]" etc.: we never download media


def parse_inbound(payload: dict) -> list[Inbound]:
    out = []
    for entry in payload.get("entry") or []:
        for ch in entry.get("changes") or []:
            for m in (ch.get("value") or {}).get("messages") or []:
                if not (isinstance(m, dict) and m.get("id") and str(m.get("from", "")).isdigit()):
                    continue
                kind = m.get("type", "")
                text = (m.get("text") or {}).get("body", "") if kind == "text" else f"[{kind or 'unknown'}]"
                out.append(Inbound(id=str(m["id"]), sender=str(m["from"]), text=str(text)[:1000]))
    return out


async def _post(payload: dict) -> bool:
    """Never raises (a Meta outage must not break lead handling); never logs the token or the message body."""
    s = get_settings()
    url = f"https://graph.facebook.com/{s.whatsapp_graph_version}/{s.whatsapp_phone_number_id}/messages"
    try:
        r = await notifier.get_http().post(
            url, json={"messaging_product": "whatsapp", **payload},
            headers={"Authorization": f"Bearer {s.whatsapp_access_token.get_secret_value()}"})
        if r.status_code >= 300:
            log.warning("whatsapp send returned %s", r.status_code)
        return r.status_code < 300
    except httpx.HTTPError as e:
        log.warning("whatsapp send failed: %s", type(e).__name__)
        return False


async def send_text(to: str, body: str) -> bool:
    return await _post({"to": to, "type": "text", "text": {"body": body[:4000], "preview_url": False}})


async def send_document(to: str, link: str, filename: str, caption: str) -> bool:
    return await _post({"to": to, "type": "document", "document": {"link": link, "filename": filename, "caption": caption[:1000]}})
