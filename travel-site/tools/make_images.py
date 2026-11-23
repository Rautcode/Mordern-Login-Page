#!/usr/bin/env python3
"""Turn your own photos into the responsive WebP files the page references.

  1. Put originals (any size, JPG/PNG) in a folder, named after the slot:
       hero-rajasthan.jpg  hero-kerala.jpg  hero-hampi.jpg  hero-goa.jpg
       card-rajasthan.jpg  card-gokarna.jpg  card-kerala.jpg  card-goa.jpg
       story.jpg  sample.jpg  band.jpg  planner.jpg
  2. python3 tools/make_images.py path/to/your/photos
  3. Files appear in img/ as <slot>-d.webp (desktop) and <slot>-m.webp (mobile). Reload the page.

Optional focus point (0-1) for the crop, e.g. keep the sun in frame:  hero-goa.jpg -> hero-goa@0.3,0.6.jpg
Needs: pip install pillow
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

SIZES = {  # slot prefix -> (desktop WxH, mobile WxH)
    "hero": ((1920, 1080), (800, 1280)),
    "card": ((1100, 825), (640, 480)),
    "story": ((900, 1125), (560, 700)),
    "sample": ((900, 1125), (560, 700)),
    "band": ((1920, 900), (800, 1100)),
    "planner": ((1600, 900), (700, 1000)),
}


def crop_to(im, w, h, fx, fy):
    scale = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    x = min(max(round((im.width - w) * fx), 0), im.width - w)
    y = min(max(round((im.height - h) * fy), 0), im.height - h)
    return im.crop((x, y, x + w, y + h))


def main(src_dir):
    out = Path(__file__).resolve().parent.parent / "img"
    out.mkdir(exist_ok=True)
    done = 0
    for f in sorted(Path(src_dir).iterdir()):
        if f.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        m = re.fullmatch(r"([a-z-]+?)(?:@([\d.]+),([\d.]+))?", f.stem)
        slot = m.group(1)
        kind = slot.split("-")[0]
        if kind not in SIZES:
            print("skip (unknown slot):", f.name)
            continue
        fx, fy = (float(m.group(2)), float(m.group(3))) if m.group(2) else (0.5, 0.5)
        im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        (dw, dh), (mw, mh) = SIZES[kind]
        crop_to(im, dw, dh, fx, fy).save(out / f"{slot}-d.webp", "WEBP", quality=74, method=6)
        crop_to(im, mw, mh, fx, fy).save(out / f"{slot}-m.webp", "WEBP", quality=72, method=6)
        print("ok", slot)
        done += 1
    print(f"{done} slot(s) written to {out}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
