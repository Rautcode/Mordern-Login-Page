"""B2B cost -> buffer -> markup -> GST -> per-person split. Pure functions, Decimal math, whole-rupee outputs."""
import math
from decimal import ROUND_HALF_UP, Decimal

from app.models.schemas import PricingInput, PricingOutput

_100 = Decimal(100)


def _r(d: Decimal) -> int:
    return int(d.quantize(Decimal(1), rounding=ROUND_HALF_UP))


def calculate(inp: PricingInput, default_gst_pct: float, advance_pct: int = 50) -> PricingOutput:
    g = inp.group_size
    rooms = math.ceil(g / inp.room_occupancy)

    lines: dict[str, Decimal] = {
        "stays": inp.room_rate_per_night * rooms * inp.nights,
        "transport": inp.vehicle_cost_per_day * inp.vehicles * inp.vehicle_days,
    }
    for it in inp.per_person_items:
        lines[it.name] = lines.get(it.name, Decimal(0)) + it.cost * g
    for it in inp.flat_items:
        lines[it.name] = lines.get(it.name, Decimal(0)) + it.cost

    base = sum(lines.values(), Decimal(0))
    buffer = base * inp.buffer_pct / _100
    markup = (base + buffer) * inp.markup_pct / _100
    subtotal = base + buffer + markup
    gst_pct = inp.gst_pct if inp.gst_pct is not None else Decimal(str(default_gst_pct))
    total_raw = subtotal * (1 + gst_pct / _100)

    per_person = math.ceil(total_raw / g)  # round UP so rounding never eats margin
    total = per_person * g
    return PricingOutput(
        breakdown={k: _r(v) for k, v in lines.items()},
        base_cost=_r(base),
        buffer=_r(buffer),
        markup=_r(markup),
        subtotal=_r(subtotal),
        gst=_r(total_raw - subtotal),
        total=total,
        per_person=per_person,
        advance=total * advance_pct // 100,
        margin_on_price_pct=round(float(markup / subtotal * 100), 2) if subtotal else 0.0,
        rooms=rooms,
    )
