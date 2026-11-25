"""Turns your original photos and clips into web-ready files for the site (needs Pillow, and ffmpeg for clips).
  python3 tools/prep_media.py photo  my.jpg  reel-temple     -> img/reel-temple-520.webp (portrait 520 px wide) + prints the size
  python3 tools/prep_media.py clip   my.mp4  temple --start 3 --dur 6  -> video/temple.webm, video/temple.mp4, img/poster-temple.webp
Everything is re-encoded, so camera and GPS data are removed. Clips lose their sound and are limited to 8 s and a small size, which keeps
the page light on mobile data. Use only media you own, and only people who have said yes."""
import argparse, re, subprocess, sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent


def kb(p): return f"{p.stat().st_size / 1024:.0f} KB"


def photo(src, name, width):
    if not re.fullmatch(r"[a-z0-9-]{2,40}", name): sys.exit("name: lowercase letters, digits and dashes only")
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if im.width < width: sys.exit(f"photo is only {im.width}px wide; need at least {width}px (use the original, not a screenshot or WhatsApp copy)")
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    out = ROOT / "img" / f"{name}-{width}.webp"; im.save(out, "WEBP", quality=78, method=6); print("wrote", out.relative_to(ROOT), kb(out), f"{im.width}x{im.height}")


def clip(src, name, start, dur, short):
    if not re.fullmatch(r"[a-z0-9-]{2,40}", name): sys.exit("name: lowercase letters, digits and dashes only")
    dur = min(dur, 8)
    vf = f"scale='if(gt(iw,ih),-2,{short})':'if(gt(iw,ih),{short},-2)',fps=24"   # short side = {short} px, whichever way up the clip is
    base = ["ffmpeg", "-y", "-v", "error", "-ss", str(start), "-t", str(dur), "-i", str(src), "-vf", vf, "-an", "-map_metadata", "-1"]
    web, mp4, poster = ROOT / "video" / f"{name}.webm", ROOT / "video" / f"{name}.mp4", ROOT / "img" / f"poster-{name}.webp"
    subprocess.run(base + ["-c:v", "libvpx-vp9", "-crf", "37", "-b:v", "0", "-row-mt", "1", str(web)], check=True)
    subprocess.run(base + ["-c:v", "libx264", "-crf", "30", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(mp4)], check=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(start + dur / 2), "-i", str(src), "-frames:v", "1", "-vf", vf, "-map_metadata", "-1", str(poster)], check=True)
    for p in (web, mp4, poster): print("wrote", p.relative_to(ROOT), kb(p))
    big = max(web.stat().st_size, mp4.stat().st_size)
    if big > 900 * 1024: print("WARNING: over 900 KB. Use a shorter --dur or a smaller --short so mobile visitors are not charged for it.")


ap = argparse.ArgumentParser(); sub = ap.add_subparsers(dest="kind", required=True)
a = sub.add_parser("photo"); a.add_argument("src"); a.add_argument("name"); a.add_argument("--width", type=int, default=520)
c = sub.add_parser("clip"); c.add_argument("src"); c.add_argument("name"); c.add_argument("--start", type=float, default=0); c.add_argument("--dur", type=float, default=6); c.add_argument("--short", type=int, default=480)
x = ap.parse_args()
photo(x.src, x.name, x.width) if x.kind == "photo" else clip(x.src, x.name, x.start, x.dur, x.short)
