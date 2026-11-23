"""Telegram admin alerts + WhatsApp click-to-chat message formatting.

Automated WhatsApp sending needs the WhatsApp Business API (Meta/Twilio), which this does not use:
we hand the admin a pre-filled wa.me link to tap. ponytail: swap `customer_wa_link` for a Business API call later.
"""
import html
import logging
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
        r = await get_http().post(
            f"https://api.telegram.org/bot{s.telegram_bot_token.get_secret_value()}/sendMessage",
            json={"chat_id": s.telegram_chat_id, "text": text_html[:4000], "parse_mode": "HTML", "disable_web_page_preview": True},
        )
        if r.status_code != 200:
            log.warning("telegram returned %s", r.status_code)
    except httpx.HTTPError as e:
        log.warning("telegram send failed: %s", type(e).__name__)


def esc(v: object) -> str:
    return html.escape(str(v), quote=True)


def fmt_new_lead(lead: dict) -> str:
    hello = f"Hi {lead['name']}! Thanks for your {lead['destination']} trip enquiry. I'm picking it up now."
    return (
        "<b>New lead</b>\n"
        f"{esc(lead['name'])} · {esc(lead['phone'])}\n"
        f"{esc(lead['destination'])} from {esc(lead['departure_city'])}\n"
        f"Dates: {esc(lead['travel_dates'])} · Group: {esc(lead['group_size'])} · Budget/pp (₹k): {esc(lead['budget'])}\n"
        f"Service: {esc(lead['service'])}\n"
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
