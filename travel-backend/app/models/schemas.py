import re
from decimal import Decimal
from enum import Enum
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, Field, StringConstraints, field_validator, model_validator

_CTRL = re.compile(r"[\x00-\x1f\x7f]")
Text60 = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]

Destination = Literal["Rajasthan", "Kerala", "Goa", "Hampi–Gokarna", "Konkan", "Himachal/Uttarakhand", "Other"]
GroupSize = Literal["1-2", "3-6", "7-12", "13+"]
Service = Literal["blueprint", "custom", "complete"]
Budget = Literal["5-10", "10-18", "18+"]


class LeadStatus(str, Enum):
    new = "new"
    generating = "generating"
    preview_ready = "preview_ready"
    needs_manual = "needs_manual"
    failed = "failed"
    quoted = "quoted"
    paid = "paid"
    delivered = "delivered"
    lost = "lost"


# ---------------- Leads ----------------
class LeadCreate(BaseModel):
    name: Text60
    phone: str = Field(max_length=20)
    destination: Destination
    departure_city: Text60 | None = None  # optional only for blueprint purchases (see validator below)
    travel_dates: Text60 | None = None
    group_size: GroupSize | None = None
    service: Service
    budget: Budget | None = None
    website: str = Field(default="", max_length=200)  # honeypot: hidden field bots fill, humans don't
    # lead source (campaign tags + referring hostname only; never a full URL)
    utm_source: Text60 | None = None
    utm_medium: Text60 | None = None
    utm_campaign: Text60 | None = None
    referrer: Text60 | None = None

    @field_validator("name", "departure_city", "travel_dates", "utm_source", "utm_medium", "utm_campaign", "referrer")
    @classmethod
    def _no_control_chars(cls, v: str | None) -> str | None:
        return _CTRL.sub(" ", v).strip() if v else v

    @field_validator("phone")
    @classmethod
    def _normalise_phone(cls, v: str) -> str:
        m = re.fullmatch(r"(?:\+?91|0)?([6-9]\d{9})", re.sub(r"[\s\-()]", "", v))
        if not m:
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return "91" + m.group(1)


    @model_validator(mode="after")
    def _full_brief_unless_blueprint(self):
        # A ₹699 impulse buy should not need an 8-field form; custom plans and packages still do.
        if self.service != "blueprint":
            missing = [f for f in ("departure_city", "travel_dates", "group_size", "budget") if not getattr(self, f)]
            if missing:
                raise ValueError("Missing: " + ", ".join(missing))
        return self


class LeadCreated(BaseModel):
    lead_id: UUID
    whatsapp_url: str


class LeadStatusOut(BaseModel):
    status: LeadStatus
    preview_url: str | None = None
    download_url: str | None = None
    payment_url: str | None = None


class StatusUpdate(BaseModel):
    status: LeadStatus


# ---------------- Itinerary (also the Gemini structured-output schema) ----------------
# Gemini's schema converter dislikes defaults/constraints, so every field is required;
# "" / [] mean "unknown" and the prompt says so.
class TransitLeg(BaseModel):
    mode: Literal["train", "flight", "road"]
    number: str  # train/flight number; "" if not in the knowledge base
    origin: str
    destination: str
    depart: str  # "HH:MM" 24h, or "Confirm on IRCTC/airline"
    arrive: str
    notes: str


class Stop(BaseModel):
    time: str  # "HH:MM" 24h
    activity: str
    kind: Literal["transit", "sight", "eat", "stay", "buffer"]
    notes: str
    hard_deadline: bool  # True if a closing time / departure makes this stop non-negotiable


class Day(BaseModel):
    day_number: int
    title: str
    transit: list[TransitLeg]
    schedule: list[Stop]
    cut_list: list[str]  # what to drop, in order, if the group runs late


class ItineraryJSON(BaseModel):
    title: str
    destination: str
    duration_days: int
    summary: str
    days: list[Day]
    packing: list[str]
    budget_notes: str
    disclaimers: list[str]


# ---------------- Payments ----------------
class PaymentLinkRequest(BaseModel):
    lead_id: UUID
    kind: Literal["blueprint", "custom_plan", "advance"]
    blueprint_id: str | None = Field(default=None, max_length=40)


class PaymentLinkOut(BaseModel):
    payment_url: str
    amount_inr: int


class GeneratePreviewRequest(BaseModel):
    lead_id: UUID


# ---------------- Pricing ----------------
class Item(BaseModel):
    name: str = Field(max_length=80)
    cost: Decimal = Field(ge=0, le=10_000_000)


class PricingInput(BaseModel):
    group_size: int = Field(ge=1, le=100)
    nights: int = Field(ge=1, le=30)
    room_occupancy: int = Field(default=3, ge=1, le=6)
    room_rate_per_night: Decimal = Field(ge=0, le=1_000_000)  # B2B cost per room-night
    vehicles: int = Field(ge=0, le=20)
    vehicle_cost_per_day: Decimal = Field(ge=0, le=1_000_000)
    vehicle_days: int = Field(ge=0, le=30)
    per_person_items: list[Item] = Field(default_factory=list, max_length=30)  # tickets, meals...
    flat_items: list[Item] = Field(default_factory=list, max_length=30)  # guide, permits...
    buffer_pct: Decimal = Field(default=Decimal("5"), ge=0, le=50)  # contingency on cost
    markup_pct: Decimal = Field(default=Decimal("15"), ge=0, le=200)  # markup ON COST (not margin)
    gst_pct: Decimal | None = Field(default=None, ge=0, le=28)  # None -> settings default


class PricingOutput(BaseModel):
    breakdown: dict[str, int]
    base_cost: int
    buffer: int
    markup: int
    subtotal: int
    gst: int
    total: int  # = per_person * group_size (never under-collects after rounding)
    per_person: int
    advance: int
    margin_on_price_pct: float  # markup / subtotal, the number you'd quote as "margin"
    rooms: int
