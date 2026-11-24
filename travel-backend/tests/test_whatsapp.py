"""WhatsApp Cloud API webhook: signature, handshake, ownership of the lead, no leaks, dedupe, human hand-off, config."""
import hashlib
import hmac
import json
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.config import Settings
from app.routers import whatsapp as wa_router
from app.services import notifier
from tests.test_flow import LEAD, env  # noqa: F401  (fixture)

SECRET = "app-secret-test"
PHONE = "919876543210"   # LEAD's phone, normalised


class Meta:   # stands in for graph.facebook.com
    def __init__(self): self.sent = []
    async def post(self, url, json=None, headers=None, **kw):
        self.sent.append((url, json, headers)); return SimpleNamespace(status_code=200, json=lambda: {})
    @property
    def types(self): return [s[1]["type"] for s in self.sent]


@pytest.fixture
def meta(env, monkeypatch):  # noqa: F811
    m = Meta(); monkeypatch.setattr(notifier, "_http", m)
    wa_router._seen.clear(); wa_router._replied.clear(); wa_router._paused.clear(); wa_router._alert_limit.hits.clear()
    return m


def payload(text, sender=PHONE, mid="wamid.1", kind="text"):
    msg = {"id": mid, "from": sender, "type": kind, **({"text": {"body": text}} if kind == "text" else {})}
    return json.dumps({"object": "whatsapp_business_account", "entry": [{"changes": [{"value": {"messages": [msg]}}]}]}).encode()


def post(env, body, secret=SECRET, sig=True):  # noqa: F811
    h = {"X-Hub-Signature-256": "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()} if sig else {}
    return env.c.post("/api/webhooks/whatsapp", content=body, headers={**h, "Content-Type": "application/json"})


def lead_with_preview(env):  # noqa: F811
    lead_id = env.c.post("/api/leads", json=LEAD).json()["lead_id"]
    row = env.db.tables["leads"][-1]; row.update(status="preview_ready", preview_pdf_path=f"{lead_id}/preview.pdf")
    return lead_id, f"Hi! I just submitted a Rajasthan trip request on your website (ref {lead_id[:8]})."


def test_handshake_accepts_only_the_right_token(env):  # noqa: F811
    ok = env.c.get("/api/webhooks/whatsapp", params={"hub.mode": "subscribe", "hub.verify_token": "verify-me-long-random", "hub.challenge": "12345"})
    assert ok.status_code == 200 and ok.text == "12345"
    for bad in ({"hub.mode": "subscribe", "hub.verify_token": "nope", "hub.challenge": "1"}, {"hub.mode": "unsubscribe", "hub.verify_token": "verify-me-long-random", "hub.challenge": "1"}, {}):
        assert env.c.get("/api/webhooks/whatsapp", params=bad).status_code == 403


def test_unsigned_or_wrongly_signed_posts_are_refused_and_do_nothing(env, meta):  # noqa: F811
    _, text = lead_with_preview(env)
    body = payload(text)
    assert post(env, body, sig=False).status_code == 403
    assert post(env, body, secret="someone-elses-secret").status_code == 403
    assert env.c.post("/api/webhooks/whatsapp", content=body, headers={"X-Hub-Signature-256": "sha256=zz"}).status_code == 403
    assert meta.sent == [] and not any("opened WhatsApp" in a for a in env.alerts)


def test_the_owner_of_a_lead_gets_an_ack_the_preview_and_the_owner_is_alerted(env, meta):  # noqa: F811
    lead_id, text = lead_with_preview(env)
    assert post(env, payload(text)).status_code == 200
    assert meta.types == ["text", "document"]
    url, body, headers = meta.sent[0]
    assert url == "https://graph.facebook.com/v23.0/1234567890/messages" and headers["Authorization"] == "Bearer EAAtest-token"
    assert body["to"] == PHONE and "Rajasthan" in body["text"]["body"] and "Rohan" in body["text"]["body"]
    doc = meta.sent[1][1]["document"]
    assert doc["link"].startswith("https://signed/") and lead_id in doc["link"] and "not a quote" in doc["caption"]
    assert any("Customer opened WhatsApp" in a and lead_id in a for a in env.alerts)


def test_the_websites_own_message_format_is_understood(env, meta):  # noqa: F811
    lead_id, _ = lead_with_preview(env)
    # exactly what index.html builds: "Hi! I'd like a quote ...", the brief, then "Ref: <8>" and an optional "Source:" line
    post(env, payload(f"Hi! I'd like a quote for this trip.\n\n*Destination:* Rajasthan\n\nRef: {lead_id[:8].upper()}\nSource: instagram"))
    assert meta.types == ["text", "document"]


def test_someone_elses_ref_unlocks_nothing(env, meta):  # noqa: F811
    _, text = lead_with_preview(env)
    post(env, payload(text, sender="919000000001"))
    assert meta.types == ["text"] and "Rohan" not in meta.sent[0][1]["text"]["body"] and "Rajasthan" not in meta.sent[0][1]["text"]["body"]
    assert not any("Customer opened" in a for a in env.alerts) and any("New WhatsApp message" in a for a in env.alerts)


def test_retried_deliveries_are_answered_once(env, meta):  # noqa: F811
    _, text = lead_with_preview(env)
    for _ in range(3):
        post(env, payload(text, mid="wamid.same"))
    assert meta.types == ["text", "document"]


def test_a_stranger_gets_one_automatic_reply_a_day_but_every_message_alerts_the_owner(env, meta):  # noqa: F811
    for i in range(3):
        post(env, payload(f"hello {i}", sender="919000000002", mid=f"wamid.{i}"))
    assert meta.types == ["text"] and "within 24 hours" in meta.sent[0][1]["text"]["body"] and "https://example.com/#planner" in meta.sent[0][1]["text"]["body"]
    assert sum("New WhatsApp message" in a for a in env.alerts) == 3


def test_sensitive_topics_and_media_go_to_a_person_and_pause_the_bot(env, meta):  # noqa: F811
    s = PHONE   # the lead's own number, so a valid ref WOULD otherwise unlock the ack and the preview
    _, text = lead_with_preview(env)
    post(env, payload("I need a refund, this is urgent", sender=s, mid="a"))
    assert meta.types == ["text"] and "person will reply" in meta.sent[0][1]["text"]["body"]
    post(env, payload(text, sender=s, mid="b"))   # even a valid ref: the bot stays quiet while a human is needed
    post(env, payload("", sender=s, mid="c", kind="image"))
    assert meta.types == ["text"], "no further automatic replies"
    assert sum("Needs a person" in a or "bot paused" in a for a in env.alerts) >= 2


def test_a_flood_from_one_number_cannot_flood_the_owner(env, meta):  # noqa: F811
    for i in range(12):
        post(env, payload(f"hi {i}", sender="919000000004", mid=f"f{i}"))
    assert sum("New WhatsApp message" in a for a in env.alerts) == 5


def test_disabled_without_config_and_partial_config_is_refused(env, monkeypatch):  # noqa: F811
    from app.config import get_settings
    monkeypatch.setattr(get_settings(), "whatsapp_app_secret", None)
    assert env.c.post("/api/webhooks/whatsapp", content=b"{}").status_code == 404
    assert env.c.get("/api/webhooks/whatsapp", params={"hub.mode": "subscribe", "hub.verify_token": "x", "hub.challenge": "1"}).status_code == 404
    with pytest.raises(ValidationError):
        Settings(_env_file=None, whatsapp_app_secret=None)   # the other three are still set in the test environment
    with pytest.raises(ValidationError):
        Settings(_env_file=None, whatsapp_graph_version="latest")
