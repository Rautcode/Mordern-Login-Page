"""End-to-end business flow against an in-memory fake of Supabase + Razorpay + Gemini.
Proves: lead -> preview -> payment link -> signed webhook -> fulfilment, plus idempotency and guards."""
import hashlib
import hmac
import json
import os
import uuid
from types import SimpleNamespace

os.environ.update(
    SUPABASE_URL="https://example.supabase.co", SUPABASE_SERVICE_KEY="x", GEMINI_API_KEY="x",
    RAZORPAY_KEY_ID="rzp_test_x", RAZORPAY_KEY_SECRET="x", RAZORPAY_WEBHOOK_SECRET="whsec_test",
    ADMIN_API_KEY="a" * 40, ENV="production",
)
import pytest
from fastapi.testclient import TestClient
from postgrest.exceptions import APIError

import app.database as database
from app.main import app
from app.services import ai_planner, notifier, pdf_generator
from tests.test_core import _itin


class Q:
    def __init__(self, fake, table):
        self.f, self.t, self.op, self.filters, self.payload, self._lim = fake, table, "select", [], None, None

    def select(self, *_, count=None, **__): self.op = "select"; return self
    def insert(self, row): self.op, self.payload = "insert", row; return self
    def update(self, vals): self.op, self.payload = "update", vals; return self
    def upsert(self, row, on_conflict=None): self.op, self.payload, self.key = "upsert", row, on_conflict; return self
    def eq(self, k, v): self.filters.append(lambda r: str(r.get(k)) == str(v)); return self
    def in_(self, k, vs): self.filters.append(lambda r: r.get(k) in vs); return self
    def lt(self, k, v): self.filters.append(lambda r: r.get(k) is not None and r[k] < v); return self
    def gte(self, k, v): self.filters.append(lambda r: r.get(k) is not None and r[k] >= v); return self
    def order(self, *_, **__): return self
    def range(self, *_): return self
    def limit(self, n): self._lim = n; return self

    async def execute(self):
        rows = self.f.tables.setdefault(self.t, [])
        match = lambda r: all(fn(r) for fn in self.filters)
        if self.op == "insert":
            row = {"id": str(uuid.uuid4()), "status": "new", "short_url": None, "created_at": "2026-01-01T00:00:00+00:00",
                   "updated_at": "2026-01-01T00:00:00+00:00", **self.payload}
            if self.t == "payments" and any(r["lead_id"] == row["lead_id"] and r["kind"] == row["kind"]
                                            and r["status"] in ("pending", "created") for r in rows):
                raise APIError({"code": "23505", "message": "duplicate"})   # the partial unique index
            rows.append(row); return SimpleNamespace(data=[row], count=None)
        if self.op == "upsert":
            old = next((r for r in rows if r[self.key] == self.payload[self.key]), None)
            if old: old.update(self.payload); return SimpleNamespace(data=[old], count=None)
            row = {"id": str(uuid.uuid4()), "created_at": "2026-01-01T00:00:00+00:00", **self.payload}
            rows.append(row); return SimpleNamespace(data=[row], count=None)
        hit = [r for r in rows if match(r)]
        if self.op == "update":
            for r in hit: r.update(self.payload)
        return SimpleNamespace(data=hit[: self._lim] if self._lim else hit, count=len(hit))


class FakeDB:
    def __init__(self):
        self.tables, self.uploads = {}, {}
        self.storage = SimpleNamespace(from_=lambda b: SimpleNamespace(upload=self._up(b), create_signed_url=self._sign(b)))
    def table(self, n): return Q(self, n)
    def _up(self, b):
        async def up(path, data, opts=None): self.uploads[(b, path)] = data
        return up
    def _sign(self, b):
        async def sign(path, ttl): return {"signedURL": f"https://signed/{b}/{path}", "signedUrl": f"https://signed/{b}/{path}"}
        return sign


class FakeHTTP:
    calls = 0
    async def post(self, url, **kw):
        FakeHTTP.calls += 1
        return SimpleNamespace(raise_for_status=lambda: None, status_code=200,
                               json=lambda: {"id": f"plink_{FakeHTTP.calls}", "short_url": f"https://rzp.io/i/{FakeHTTP.calls}"})


@pytest.fixture
def env(monkeypatch):
    fake, alerts = FakeDB(), []
    monkeypatch.setattr(database, "_client", fake)
    monkeypatch.setattr(notifier, "_http", FakeHTTP())
    async def alert(t): alerts.append(t)
    monkeypatch.setattr(notifier, "notify_admin", alert)
    async def gen(lead, kb): return _itin("12955"), {"in": 10, "out": 20}
    monkeypatch.setattr(ai_planner, "generate_itinerary", gen)
    from app.services import rag_loader
    rag_loader.load_all()
    return SimpleNamespace(c=TestClient(app), db=fake, alerts=alerts)


LEAD = dict(name="Rohan", phone="9876543210", destination="Rajasthan", departure_city="Pune",
            travel_dates="12-17 Dec", group_size="7-12", service="custom", budget="10-18")


def sign(body: bytes) -> dict:
    return {"X-Razorpay-Signature": hmac.new(b"whsec_test", body, hashlib.sha256).hexdigest()}


def test_full_flow_idempotent_and_guarded(env):
    c = env.c
    # lead
    r = c.post("/api/leads", json=LEAD); assert r.status_code == 201
    lid = r.json()["lead_id"]; assert r.json()["whatsapp_url"].startswith("https://wa.me/")
    assert any("New lead" in a for a in env.alerts)
    # preview (background job runs before TestClient returns)
    assert c.post("/api/generate-preview", json={"lead_id": lid}).status_code == 202
    st = c.get(f"/api/leads/{lid}/status").json()
    assert st["status"] == "preview_ready" and st["preview_url"].startswith("https://signed/itineraries/")
    assert "phone" not in json.dumps(st)                                    # status endpoint leaks no PII
    assert c.post("/api/generate-preview", json={"lead_id": lid}).json() == {"status": "preview_ready"}
    # payment link: server-side amount, duplicate returns same link
    p1 = c.post("/api/create-payment-link", json={"lead_id": lid, "kind": "custom_plan"}).json()
    p2 = c.post("/api/create-payment-link", json={"lead_id": lid, "kind": "custom_plan"}).json()
    assert p1["amount_inr"] == 2499 and p1 == p2 and FakeHTTP.calls == 1
    # advance needs admin
    assert c.post("/api/create-payment-link", json={"lead_id": lid, "kind": "advance"}).status_code == 401
    # webhook: unsigned rejected, signed processed once, replay is a no-op
    event = {"event": "payment_link.paid", "payload": {"payment_link": {"entity": {"id": "plink_1", "amount_paid": 249900}},
                                                       "payment": {"entity": {"id": "pay_1"}}}}
    body = json.dumps(event).encode()
    assert c.post("/api/webhooks/razorpay", content=body, headers={"X-Razorpay-Signature": "x"}).status_code == 400
    assert c.post("/api/webhooks/razorpay", content=body, headers=sign(body)).json() == {"status": "ok"}
    assert c.post("/api/webhooks/razorpay", content=body, headers=sign(body)).json() == {"status": "duplicate"}
    lead = env.db.tables["leads"][0]
    assert lead["status"] == "paid" and lead["full_pdf_path"] == f"{lid}/full.pdf"
    assert env.db.uploads[("itineraries", f"{lid}/full.pdf")].startswith(b"%PDF")
    assert sum("Paid: custom itinerary" in a for a in env.alerts) == 1      # delivered exactly once
    assert c.get(f"/api/leads/{lid}/status").json()["download_url"]


def test_underpayment_is_not_marked_paid(env):
    c = env.c
    lid = c.post("/api/leads", json={**LEAD, "service": "blueprint"}).json()["lead_id"]
    c.post("/api/create-payment-link", json={"lead_id": lid, "kind": "blueprint", "blueprint_id": "goa"})
    link_id = env.db.tables["payments"][0]["rp_link_id"]
    body = json.dumps({"event": "payment_link.paid", "payload": {"payment_link": {"entity": {"id": link_id, "amount_paid": 100}}}}).encode()
    assert c.post("/api/webhooks/razorpay", content=body, headers=sign(body)).json() == {"status": "underpaid"}
    assert env.db.tables["payments"][0]["status"] == "created"


def test_honeypot_and_manual_destination_and_blueprint_guard(env):
    c = env.c
    assert c.post("/api/leads", json={**LEAD, "website": "http://spam"}).status_code == 201
    assert env.db.tables.get("leads", []) == []                              # nothing stored
    lid = c.post("/api/leads", json={**LEAD, "destination": "Other"}).json()["lead_id"]
    assert c.post("/api/generate-preview", json={"lead_id": lid}).json() == {"status": "needs_manual"}
    bl = c.post("/api/leads", json={**LEAD, "service": "blueprint"}).json()["lead_id"]
    assert c.post("/api/generate-preview", json={"lead_id": bl}).status_code == 400
    assert c.post("/api/create-payment-link", json={"lead_id": bl, "kind": "custom_plan"}).status_code == 400
