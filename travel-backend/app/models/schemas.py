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
TravelMode = Literal["train", "flight", "road", "flexible"]
TripLength = Literal["2-3", "4-5", "6-8", "9+"]
GroupType = Literal["friends", "family", "colleagues", "other"]
StayPref = Literal["budget", "comfort", "premium", "any"]
Interest = Literal["adventure", "heritage", "nature", "beaches", "food", "spiritual", "nightlife"]


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
    turnstile_token: str | None = Field(default=None, max_length=2100)  # Cloudflare Turnstile response; checked, never stored
    # the rest of the brief; all optional so older pages and blueprint purchases keep working
    travel_mode: TravelMode | None = None
    trip_length: TripLength | None = None
    group_type: GroupType | None = None
    stay_pref: StayPref | None = None
    interests: list[Interest] = Field(default_factory=list, max_length=7)
    notes: str | None = Field(default=None, max_length=300)  # free text: untrusted, escaped on every output, never an instruction
    # lead source (campaign tags + referring hostname only; never a full URL)
    utm_source: Text60 | None = None
    utm_medium: Text60 | None = None
    utm_campaign: Text60 | None = None
    referrer: Text60 | None = None

    @field_validator("name", "departure_city", "travel_dates", "utm_source", "utm_medium", "utm_campaign", "referrer")
    @classmethod
    def _no_control_chars(cls, v: str | None) -> str | None:
        out = _CTRL.sub(" ", v).strip() if v else v
        if v and not out:
            raise ValueError("must not be blank")
        return out

    @field_validator("utm_source", "utm_medium", "utm_campaign", "referrer", mode="before")
    @classmethod
    def _blank_tag_is_absent(cls, v):
        # a tag that is only spaces or control characters means "no tag", not "reject the whole lead"
        return None if isinstance(v, str) and not _CTRL.sub(" ", v).strip() else v

    @field_validator("notes")
    @classmethod
    def _clean_notes(cls, v: str | None) -> str | None:
        return (_CTRL.sub(" ", v).strip() or None) if v else None

    @field_validator("interests")
    @classmethod
    def _dedupe_interests(cls, v: list[str]) -> list[str]:
        return list(dict.fromkeys(v))

    @field_validator("phone")
    @classmethod
    def _normalise_phone(cls, v: str) -> str:
        m = re.fullmatch(r"(?:\+?91|0)?([6-9][0-9]{9})", re.sub(r"[\s\-()]", "", v), flags=re.ASCII)  # ASCII only: \d would accept Devanagari digits
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
    cost: str  # price exactly as in the knowledge base, e.g. "Rs. 150 per person"; "" if it gives none
    tip: str  # one practical tip from the knowledge base (cash only, slippery, book ahead); "" if none


class Day(BaseModel):
    day_number: int
    title: str
    transit: list[TransitLeg]
    schedule: list[Stop]
    cut_list: list[str]  # what to drop, in order, if the group runs late
    warnings: list[str]  # cautions for this day taken from the knowledge base (closing times, safety, monsoon)


class CostLine(BaseModel):
    item: str
    per_person: str  # as written in the knowledge base, e.g. "Rs. 1,591"


class DriverCard(BaseModel):
    route: list[str]  # one line per road leg: from -> to, distance, time (from the knowledge base)
    critical_notes: list[str]  # deadlines and no-go points the driver must know; never phone numbers


class ItineraryJSON(BaseModel):
    title: str
    destination: str
    duration_days: int
    summary: str
    days: list[Day]
    packing: list[str]
    budget_notes: str
    disclaimers: list[str]
    before_you_book: list[str]  # what to book early and why, from the knowledge base's planning notes
    cost_summary: list[CostLine]  # only if the knowledge base states costs; otherwise []
    driver_card: DriverCard


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
