"""Smallest checks that fail if money, security or the hallucination guard break.
Run: pip install pytest && pytest -q   (from travel-backend/)"""
import asyncio
import hashlib
import hmac
import os

os.environ.update(
    SUPABASE_URL="https://example.supabase.co", SUPABASE_SERVICE_KEY="x", GEMINI_API_KEY="x",
    RAZORPAY_KEY_ID="rzp_test_x", RAZORPAY_KEY_SECRET="x", RAZORPAY_WEBHOOK_SECRET="whsec_test",
    ADMIN_API_KEY="a" * 40, ENV="production",
)

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.models.schemas import Day, ItineraryJSON, LeadCreate, PricingInput, Stop, TransitLeg
from app.routers.payments import amount_paise, verify_signature
from app.services import ai_planner, pdf_generator, pricing_engine, rag_loader


def test_pricing_math_and_rounding():
    inp = PricingInput(group_size=12, nights=4, room_occupancy=3, room_rate_per_night=2000,
                       vehicles=1, vehicle_cost_per_day=6000, vehicle_days=5,
                       per_person_items=[{"name": "tickets", "cost": 500}], flat_items=[{"name": "guide", "cost": 3000}],
                       buffer_pct=5, markup_pct=15, gst_pct=5)
    out = pricing_engine.calculate(inp, 5.0)
    assert out.rooms == 4
    assert out.breakdown["stays"] == 32000 and out.breakdown["transport"] == 30000
    assert out.base_cost == 32000 + 30000 + 6000 + 3000          # 71000
    assert out.markup == 11183                                   # 15% of (71000+3550) = 11182.50 -> half-up
    assert out.total == out.per_person * 12                      # split is exact, never under-collects
    assert out.total >= (71000 + 3550 + 11182.5) * 1.05          # >= unrounded GST-inclusive price
    assert out.advance == out.total // 2


def test_phone_normalisation_and_validation():
    ok = dict(name="A", departure_city="Pune", travel_dates="Dec", destination="Goa",
              group_size="3-6", service="custom", budget="5-10")
    assert LeadCreate(phone="+91 98765-43210", **ok).phone == "919876543210"
    with pytest.raises(ValidationError):
        LeadCreate(phone="12345", **ok)
    with pytest.raises(ValidationError):
        LeadCreate(phone="9876543210", **{**ok, "destination": "Mars"})


def test_blueprint_lead_needs_only_contact_and_destination():
    ok = LeadCreate(name="A", phone="9876543210", destination="Goa", service="blueprint")
    assert ok.departure_city is None and ok.phone == "919876543210"
    with pytest.raises(ValidationError):                      # custom plans still need the full brief
        LeadCreate(name="A", phone="9876543210", destination="Goa", service="custom")
    with pytest.raises(ValidationError):
        LeadCreate(name="A", phone="9876543210", destination="Goa", service="complete", departure_city="Pune")


def test_webhook_signature_and_endpoint_rejects_forgery():
    body = b'{"event":"payment_link.paid"}'
    good = hmac.new(b"whsec_test", body, hashlib.sha256).hexdigest()
    assert verify_signature(body, good, "whsec_test")
    assert not verify_signature(body, "deadbeef", "whsec_test")
    assert not verify_signature(body, "é", "whsec_test")          # non-ASCII must not raise
    c = TestClient(app)                                            # no lifespan: bad sig is rejected before any I/O
    assert c.post("/api/webhooks/razorpay", content=body, headers={"X-Razorpay-Signature": "bad"}).status_code == 400


def test_admin_requires_key_and_docs_hidden_in_prod():
    c = TestClient(app)
    assert c.get("/api/admin/leads").status_code == 401
    assert c.get("/api/admin/leads", headers={"X-Admin-Key": "wrong"}).status_code == 401
    assert c.get("/docs").status_code == 404
    assert c.get("/health").json() == {"status": "ok"}


def test_payment_amounts_are_server_side():
    assert amount_paise("blueprint", {}, "rajasthan") == 79900
    assert amount_paise("custom_plan", {}, None) == 249900
    assert amount_paise("advance", {"quote_total_paise": 1_000_001}, None) == 500_000
    with pytest.raises(Exception):
        amount_paise("blueprint", {}, "nope")
    with pytest.raises(Exception):
        amount_paise("advance", {}, None)                          # no quote -> no advance link


def _itin(number: str, mode="train") -> ItineraryJSON:
    leg = TransitLeg(mode=mode, number=number, origin="A", destination="B", depart="x", arrive="y", notes="")
    return ItineraryJSON(title="t", destination="Rajasthan", duration_days=1, summary="s", packing=[], budget_notes="", disclaimers=[],
                         days=[Day(day_number=1, title="d", transit=[leg], cut_list=["c"],
                                   schedule=[Stop(time="08:00", activity="Amer <b>Fort</b>", kind="sight", notes="", hard_deadline=True)])])


def test_hallucination_guard():
    rag_loader.load_all()
    allowed = rag_loader.allowed_identifiers(rag_loader.get_context("Rajasthan"))
    assert {"12955", "12468", "20495"} <= allowed
    assert ai_planner.find_unverified(_itin("12955"), allowed) == []
    assert ai_planner.find_unverified(_itin(""), allowed) == []    # unknown -> empty is allowed
    assert ai_planner.find_unverified(_itin("99999"), allowed)     # invented -> flagged


def test_pdf_renders_and_escapes_markup():
    asyncio.run(pdf_generator.self_check())
    lead = dict(name="<script>x</script>", departure_city="Pune", travel_dates="Dec", group_size="3-6")
    for preview in (True, False):
        pdf = asyncio.run(pdf_generator.render_pdf(_itin("12955"), lead, preview))
        assert pdf.startswith(b"%PDF") and len(pdf) > 2000
