"""Verified-route knowledge base.

Not vector RAG: four small Markdown files fit in one prompt, so we inject the whole destination file.
ponytail: add embeddings/chunking only when a destination file outgrows ~30k tokens.
"""
import logging
import re
from pathlib import Path

log = logging.getLogger(__name__)

KB_DIR = Path(__file__).resolve().parent.parent / "knowledge_base"

# Fixed allow-list: user input never selects a filename (no path traversal).
DESTINATION_FILES = {
    "Rajasthan": "rajasthan.md",
    "Kerala": "kerala.md",
    "Goa": "goa.md",
    "Hampi–Gokarna": "hampi_gokarna.md",
}

# Ready-made PDFs live in the private `blueprints` bucket under `file`. Prices must match the website.
# Only routes with a real, finished plan are sold as blueprints. Add an entry (and upload its PDF to the blueprints bucket) when a route is ready.
BLUEPRINTS = {
    "rajasthan": {"title": "Jaipur → Jaisalmer → Jodhpur (6D/5N)", "destination": "Rajasthan", "price_inr": 799, "file": "rajasthan.pdf"},
    "kerala": {"title": "Kochi → Munnar → Thekkady → Alleppey (3D/2N)", "destination": "Kerala", "price_inr": 699, "file": "kerala.pdf"},
}

_cache: dict[str, str] = {}
_ID_RE = re.compile(r"\b(?:\d{5}|[A-Z0-9]{2}\s?\d{3,4})\b")  # train numbers, flight numbers (e.g. 6E 123)


def load_all() -> None:
    for dest, fname in DESTINATION_FILES.items():
        _cache[dest] = (KB_DIR / fname).read_text(encoding="utf-8")
        unverified = _cache[dest].count("[VERIFY]") + _cache[dest].count("[ADD")
        if unverified:
            log.warning("KB %s still has %d unverified/placeholder items", fname, unverified)


def get_context(destination: str) -> str | None:
    return _cache.get(destination)


def allowed_identifiers(kb_text: str) -> set[str]:
    """Train/flight numbers present in the KB, whitespace-stripped. The AI may output only these."""
    return {re.sub(r"\s", "", m) for m in _ID_RE.findall(kb_text)}
