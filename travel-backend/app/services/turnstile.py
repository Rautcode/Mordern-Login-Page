"""Cloudflare Turnstile: a server-side check that a lead came from a real browser session. Opt-in: set TURNSTILE_SECRET.

Fails closed: a missing token, a rejected token or an unreachable Cloudflare all mean "not verified". That is safe because the
site falls back to a WhatsApp message whenever the API refuses, so a real customer is never lost.
"""
import logging

import httpx

from app.config import get_settings
from app.services import notifier

log = logging.getLogger(__name__)
VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


def enabled() -> bool:
    s = get_settings().turnstile_secret
    return bool(s and s.get_secret_value())


async def verify(token: str | None, remote_ip: str | None) -> bool:
    if not token:
        return False
    data = {"secret": get_settings().turnstile_secret.get_secret_value(), "response": token}
    if remote_ip:
        data["remoteip"] = remote_ip
    try:
        r = await notifier.get_http().post(VERIFY, data=data)
        return r.status_code == 200 and r.json().get("success") is True
    except (httpx.HTTPError, ValueError) as e:
        log.warning("turnstile verification failed: %s", type(e).__name__)
        return False
