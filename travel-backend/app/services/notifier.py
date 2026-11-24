"""Telegram admin alerts + WhatsApp click-to-chat message formatting.

Automated WhatsApp sending needs the WhatsApp Business API (Meta/Twilio), which this does not use:
we hand the admin a pre-filled wa.me link to tap. ponytail: swap `customer_wa_link` for a Business API call later.
"""
import html
import logging
import re
from urllib.parse import quote

import httpx

from app.config import get_settings

log = logging.getLogger(__name__)
_http: httpx.AsyncClient | None = None


def init(client: httpx.AsyncClient) -> None:
    global _http
    _http = client
    # httpx logs full request URLs at INFO, and Telegram's URL contains the bot token.
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_http() -> httpx.AsyncClient:
    if _http is None:
        raise RuntimeError("HTTP client not initialised")
    return _http


async def close() -> None:
    if _http:
        await _http.aclose()


def customer_wa_link(phone: str, text: str) -> str:
    return f"https://wa.me/{phone}?text={quote(text)}"


def agency_wa_link(text: str) -> str:
    return f"https://wa.me/{get_settings().whatsapp_number}?text={quote(text)}"


async def notify_admin(text_html: str) -> None:
    """Never raises: an alerting outage must not break lead capture or payment handling."""
    s = get_settings()
    if not (s.telegram_bot_token and s.telegram_chat_id):
        log.info("telegram not configured; alert dropped")
        return
    try:
        url = f"https://api.telegram.org/bot{s.telegram_bot_token.get_secret_value()}/sendMessage"
        r = await get_http().post(
            url, json={"chat_id": s.telegram_chat_id, "text": text_html[:4000], "parse_mode": "HTML", "disable_web_page_preview": True})
        if r.status_code == 400:  # usually our own HTML cut mid-tag at 4000 chars: send it as plain text rather than lose the alert
            plain = html.unescape(re.sub(r"<[^>]+>", "", text_html))[:4000]
            r = await get_http().post(url, json={"chat_id": s.telegram_chat_id, "text": plain, "disable_web_page_preview": True})
        if r.status_code != 200:
            log.warning("telegram returned %s", r.status_code)
    except httpx.HTTPError as e:
        log.warning("telegram send failed: %s", type(e).__name__)


def esc(v: object) -> str:
    return html.escape(str(v), quote=True)


def source_label(lead: dict) -> str:
    parts = [lead.get("utm_source"), lead.get("utm_medium"), lead.get("utm_campaign")]
    tag = " / ".join(p for p in parts if p)
    return tag or (f"referral from {lead['referrer']}" if lead.get("referrer") else "direct")


_MODE = {"train": "train", "flight": "flight", "road": "road trip", "flexible": "mode: advise me"}


def brief_lines(lead: dict) -> list[str]:
    """Optional parts of the brief as escaped Telegram lines. Notes are customer free text: escaped and clipped."""
    trip = " · ".join(x for x in (
        _MODE.get(lead.get("travel_mode") or ""), lead.get("trip_length") and f"{lead['trip_length']} days",
        lead.get("group_type"), lead.get("stay_pref") and f"stay: {lead['stay_pref']}") if x)
    out = [f"Trip: {esc(trip)}"] if trip else []
    if lead.get("interests"):
        out.append(f"Interests: {esc(lead['interests'])}")
    if lead.get("notes"):
        out.append(f"Notes: {esc(str(lead['notes'])[:200])}")
    return out


def fmt_new_lead(lead: dict) -> str:
    hello = f"Hi {lead['name']}! Thanks for your {lead['destination']} trip enquiry. I'm picking it up now."
    return (
        "<b>New lead</b>\n"
        f"{esc(lead['name'])} · {esc(lead['phone'])}\n"
        f"{esc(lead['destination'])} from {esc(lead.get('departure_city') or '-')}\n"
        f"Dates: {esc(lead.get('travel_dates') or '-')} · Group: {esc(lead.get('group_size') or '-')} · Budget/pp (₹k): {esc(lead.get('budget') or '-')}\n"
        f"Service: {esc(lead['service'])}\n"
        + "".join(line + "\n" for line in brief_lines(lead)) +
        f"Source: {esc(source_label(lead))}\n"
        f'<a href="{esc(customer_wa_link(lead["phone"], hello))}">Reply on WhatsApp</a>\n'
        f"<code>{esc(lead['id'])}</code>"
    )


def fmt_delivery(lead: dict, label: str, url: str) -> str:
    msg = f"Hi {lead['name']}! Payment received, thank you. Your {label} is ready (link valid 7 days): {url}"
    return (
        f"<b>Paid: {esc(label)}</b>\n{esc(lead['name'])} · {esc(lead['phone'])}\n"
        f'<a href="{esc(customer_wa_link(lead["phone"], msg))}">Send PDF on WhatsApp</a>\n'
        f"<code>{esc(lead['id'])}</code>"
    )
