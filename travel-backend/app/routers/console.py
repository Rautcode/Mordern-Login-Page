"""Serves the admin console (app/admin_ui) from the API's own origin.

Same origin means no CORS, no API base to configure, and the admin key never has to be sent cross-site.
Every lead field is attacker-controlled text, so the page is locked down: no inline script or style, no third parties.
Loading the page needs no key (it is only a login form); every data call goes through /api/admin and requires one.
"""
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

UI = Path(__file__).resolve().parent.parent / "admin_ui"
ASSETS = {"": ("index.html", "text/html"), "console.js": ("console.js", "text/javascript"), "console.css": ("console.css", "text/css")}
# One line on purpose: travel-site/tests/admin.js reads it from here so the browser test enforces exactly what ships.
CSP = "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
HEADERS = {
    "Content-Security-Policy": CSP,
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
}
router = APIRouter(prefix="/admin", tags=["console"], include_in_schema=False)


@router.get("")
@router.get("/")
@router.get("/{name}")
async def asset(name: str = ""):
    hit = ASSETS.get(name)
    if not hit:
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(UI / hit[0], media_type=hit[1], headers=HEADERS)
