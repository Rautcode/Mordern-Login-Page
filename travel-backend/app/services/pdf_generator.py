"""Jinja2 -> WeasyPrint PDF -> Supabase Storage."""
import asyncio
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.config import get_settings
from app.database import upload_pdf
from app.models.schemas import ItineraryJSON

_env = Environment(
    loader=FileSystemLoader(Path(__file__).resolve().parent.parent / "templates"),
    autoescape=select_autoescape(["html"]),  # AI/customer text can never inject markup
)
_sem = asyncio.Semaphore(2)  # WeasyPrint is CPU/RAM heavy; bound concurrency


def _deny_fetch(url, *_, **__):
    # SSRF/exfil guard: the template needs no network or file access. Block everything.
    raise ValueError(f"blocked fetch: {url[:60]}")


def _render_sync(html: str) -> bytes:
    from weasyprint import HTML  # lazy: import fails loudly in self_check() if Pango is missing

    return HTML(string=html, url_fetcher=_deny_fetch).write_pdf()


async def render_pdf(itin: ItineraryJSON, lead: dict, preview: bool) -> bytes:
    html = _env.get_template("itinerary_pdf.html").render(
        it=itin.model_dump(),
        lead={k: lead.get(k) or "" for k in ("name", "departure_city", "travel_dates", "group_size")},  # blueprint leads omit most
        preview=preview,
        brand=get_settings().brand_name,
    )
    async with _sem:
        return await asyncio.to_thread(_render_sync, html)


async def store_pdf(lead_id: str, kind: str, data: bytes) -> str:
    """kind: 'preview' | 'full'. Returns the storage path (sign it on read)."""
    path = f"{lead_id}/{kind}.pdf"
    await upload_pdf(get_settings().storage_bucket, path, data)
    return path


async def self_check() -> None:
    """Fail startup if Pango/fonts are missing rather than failing the first paying customer."""
    pdf = await asyncio.to_thread(_render_sync, "<p>ok</p>")
    if not pdf.startswith(b"%PDF"):
        raise RuntimeError("WeasyPrint self-check failed")
