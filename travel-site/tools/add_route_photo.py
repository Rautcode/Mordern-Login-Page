#!/usr/bin/env python3
"""Put a real photo on a route card (for example Rajasthan, which still shows an illustration).

    pip install pillow
    python3 tools/add_route_photo.py rajasthan ~/Pictures/jaisalmer.jpg --alt "Camels crossing dunes near Jaisalmer at sunset"

It writes img/trip-<route>-480.webp and img/trip-<route>-800.webp (cropped to 16:10, camera metadata such as GPS location removed
by re-encoding) and swaps the card's illustration or old photo for it. Then run the tests. Use only photos you took or have permission to use.
"""
import argparse, html, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def die(msg):
    sys.exit(f"add_route_photo: {msg}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("route", help="card id: rajasthan, gokarna, kerala or goa")
    ap.add_argument("photo")
    ap.add_argument("--alt", required=True, help="what the photo shows, for screen readers and search engines (10-160 characters)")
    ap.add_argument("--root", default=str(ROOT), help="site folder (default: this one)")
    a = ap.parse_args()
    root = Path(a.root)
    try:
        from PIL import Image, ImageOps
    except ImportError:
        die("Pillow is needed: pip install pillow")
    page = (root / "index.html").read_text(encoding="utf-8")
    routes = re.findall(r'<div class="art" data-photo="([\w-]+)">', page)
    if a.route not in routes:
        die(f"unknown route '{a.route}'. Cards on the page: {', '.join(routes)}")
    if not 10 <= len(a.alt) <= 160:
        die("--alt should describe the photo in 10-160 characters")
    src = Path(a.photo)
    if not src.is_file():
        die(f"cannot find {src}")
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")   # honour the camera's rotation, then drop all metadata on save
    w, h = im.size
    if w < 800 or h < 500:
        die(f"the photo is {w}x{h}; use one at least 800x500 so it stays sharp")
    tw, th = (w, round(w * 10 / 16)) if w / h < 1.6 else (round(h * 1.6), h)   # centre-crop to 16:10
    left, top = (w - tw) // 2, (h - th) // 2
    im = im.crop((left, top, left + tw, top + th))
    (root / "img").mkdir(exist_ok=True)
    for width in (480, 800):
        im.resize((width, round(width * 10 / 16)), Image.LANCZOS).save(root / "img" / f"trip-{a.route}-{width}.webp", "WEBP", quality=80, method=6)
    tag = (f'<img src="img/trip-{a.route}-800.webp" srcset="img/trip-{a.route}-480.webp 480w, img/trip-{a.route}-800.webp 800w" '
           f'sizes="(max-width:700px) 100vw, 360px" alt="{html.escape(a.alt, quote=True)}" width="800" height="500" loading="lazy" decoding="async">')
    new, n = re.subn(r'(<div class="art" data-photo="%s">)(?:<svg\b.*?</svg>|<img\b[^>]*>)' % re.escape(a.route), lambda m: m.group(1) + tag, page, count=1, flags=re.S)
    if n != 1:
        die("could not find the card's picture to replace")
    (root / "index.html").write_text(new, encoding="utf-8")
    print(f"ok: {a.route} card now uses your photo (img/trip-{a.route}-480.webp and -800.webp). Next: python3 tools/build_routes.py && npm test")


if __name__ == "__main__":
    main()
