"""Smallest checks that fail if money, security or the hallucination guard break.
Run: pip install pytest && pytest -q   (from travel-backend/)"""
import asyncio
import hashlib
import hmac
import os

# test environment: see tests/conftest.py

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from pathlib import Path

from app.models.schemas import Day, DriverCard, ItineraryJSON, LeadCreate, PricingInput, Stop, TransitLeg
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


def test_lead_source_fields_are_optional_bounded_and_cleaned():
    base = dict(name="A", phone="9876543210", destination="Goa", service="blueprint")
    ok = LeadCreate(utm_source="instagram", utm_medium="bio", utm_campaign="goa-dec", referrer="l.instagram.com", **base)
    assert (ok.utm_source, ok.referrer) == ("instagram", "l.instagram.com")
    assert LeadCreate(**base).utm_source is None
    assert LeadCreate(utm_source="a\nb", **base).utm_source == "a b"          # control characters neutralised
    with pytest.raises(ValidationError):
        LeadCreate(utm_campaign="x" * 61, **base)


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
                         before_you_book=[], cost_summary=[], driver_card=DriverCard(route=[], critical_notes=[]),
                         days=[Day(day_number=1, title="d", transit=[leg], cut_list=["c"], warnings=[],
                                   schedule=[Stop(time="08:00", activity="Amer <b>Fort</b>", kind="sight", notes="", hard_deadline=True, cost="", tip="")])])


def test_hallucination_guard():
    rag_loader.load_all()
    allowed = rag_loader.allowed_identifiers(rag_loader.get_context("Rajasthan"))
    assert {"12955", "12468", "20495", "12939"} <= allowed
    assert ai_planner.find_unverified(_itin("12955"), allowed) == []
    assert ai_planner.find_unverified(_itin(""), allowed) == []    # unknown -> empty is allowed
    assert ai_planner.find_unverified(_itin("99999"), allowed)     # invented -> flagged


def test_pdf_renders_and_escapes_markup():
    asyncio.run(pdf_generator.self_check())
    lead = dict(name="<script>x</script>", departure_city="Pune", travel_dates="Dec", group_size="3-6")
    for preview in (True, False):
        pdf = asyncio.run(pdf_generator.render_pdf(_itin("12955"), lead, preview))
        assert pdf.startswith(b"%PDF") and len(pdf) > 2000


def test_knowledge_base_holds_no_private_phone_numbers():
    """The KB is committed to git and fed to an LLM. Vendor/driver numbers belong only in the delivered PDF."""
    import re
    rag_loader.load_all()
    for dest in ("Rajasthan", "Kerala", "Goa", "Hampi–Gokarna"):
        kb = rag_loader.get_context(dest)
        assert not re.search(r"(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b", kb), f"phone-like number in {dest} knowledge base"


def test_console_is_served_locked_down():
    c = TestClient(app)
    r = c.get("/admin")
    assert r.status_code == 200 and "Leads console" in r.text and "<script>" not in r.text      # no inline script
    csp = r.headers["content-security-policy"]
    assert "script-src 'self'" in csp and "unsafe-inline" not in csp and "frame-ancestors 'none'" in csp
    assert r.headers["cache-control"] == "no-store" and "noindex" in r.headers["x-robots-tag"]
    assert c.get("/admin/console.js").headers["content-type"].startswith("text/javascript")
    assert c.get("/admin/console.css").status_code == 200
    assert c.get("/admin/main.py").status_code == 404 and c.get("/admin/..%2Fmain.py").status_code == 404


def test_admin_api_throttles_key_guessing():
    from app.routers import admin as admin_router
    admin_router._admin_limit.hits.clear()
    c = TestClient(app)
    codes = [c.get("/api/admin/leads", headers={"X-Admin-Key": "wrong"}).status_code for _ in range(121)]
    assert codes[0] == 401 and codes[-1] == 429
    admin_router._admin_limit.hits.clear()                      # don't starve other tests that share this client IP


# ---- richer PDF: real plan as fixture ----
KERALA = Path(__file__).parent / "fixtures" / "kerala_itinerary.json"


def _kerala() -> ItineraryJSON:
    return ItineraryJSON.model_validate_json(KERALA.read_text(encoding="utf-8"))


def _html(it: ItineraryJSON, lead: dict, preview: bool) -> str:
    return pdf_generator._env.get_template("itinerary_pdf.html").render(it=it.model_dump(), lead=lead, preview=preview, brand="B")


def test_real_kerala_plan_passes_both_hallucination_guards():
    rag_loader.load_all()
    kb = rag_loader.get_context("Kerala")
    it = _kerala()
    assert ai_planner.find_unverified(it, rag_loader.allowed_identifiers(kb)) == []
    assert ai_planner.find_unverified_amounts(it, kb) == []          # every price on the page is one the operator wrote down


def test_invented_amounts_are_flagged():
    rag_loader.load_all()
    kb = rag_loader.get_context("Kerala")
    it = _kerala()
    it.days[0].schedule[3].cost = "Rs. 9,999 per person"
    it.cost_summary[0].per_person = "Rs. 123"
    bad = " ".join(ai_planner.find_unverified_amounts(it, kb))
    assert "9999" in bad and "123" in bad


def test_pdf_sections_and_preview_gating():
    lead = dict(name="Asha", departure_city="Pune", travel_dates="June", group_size="7-12")
    full, prev = _html(_kerala(), lead, False), _html(_kerala(), lead, True)
    for needle in ("Driver quick card", "Before you book", "Cost per person", "Watch out today", "Tip: Slippery rocks", "about Rs. 17,849"):
        assert needle in full, needle
    for paid in ("Driver quick card", "Before you book", "Cost per person", "about Rs. 17,849"):
        assert paid not in prev, f"{paid} must stay behind the paywall"
    assert "Rs. 150 per person" in prev                                # Day 1 is the free sample, costs included


def test_pdf_survives_blank_lead_fields_and_hostile_text():
    it = _kerala()
    it.days[0].warnings = ["<script>alert(1)</script>"]
    blank = dict(name="Asha", departure_city=None, travel_dates=None, group_size=None)   # blueprint leads omit these
    pdf = asyncio.run(pdf_generator.render_pdf(it, blank, False))
    assert pdf.startswith(b"%PDF") and len(pdf) > 5000
    html = _html(it, {k: v or "" for k, v in blank.items()}, False)
    assert "None" not in html and "<script>alert" not in html and "&lt;script&gt;" in html


def test_lead_brief_fields_are_optional_closed_sets_and_cleaned():
    base = dict(name="A", phone="9876543210", destination="Goa", service="blueprint")
    ok = LeadCreate(travel_mode="road", trip_length="4-5", group_type="friends", stay_pref="comfort",
                    interests=["food", "adventure", "food"], notes="  Two seniors,\nvegetarian\x00 ", **base)
    assert (ok.travel_mode, ok.trip_length, ok.group_type, ok.stay_pref) == ("road", "4-5", "friends", "comfort")
    assert ok.interests == ["food", "adventure"]                      # de-duplicated, order kept
    assert ok.notes == "Two seniors, vegetarian"                      # control characters neutralised
    bare = LeadCreate(**base)
    assert bare.travel_mode is None and bare.interests == [] and bare.notes is None
    assert LeadCreate(notes="   ", **base).notes is None
    for bad in (dict(travel_mode="teleport"), dict(trip_length="1"), dict(group_type="x"), dict(stay_pref="x"),
                dict(interests=["skydiving"]), dict(interests=["food"] * 8), dict(notes="x" * 301)):
        with pytest.raises(ValidationError):
            LeadCreate(**bad, **base)
