"""Draws the GhumoCo mountain-range band (brand/ghumoco-mountains-light.svg for light backgrounds, -dark.svg for dark ones).
Same palette as the logo: forest greens, cream snow caps and the orange sun. Run: python3 tools/make_mountains.py"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACK = [(0, 170), (110, 118), (200, 152), (330, 52), (440, 142), (540, 104), (650, 34), (770, 132), (870, 86), (990, 140), (1090, 70), (1200, 170)]
MID = [(0, 204), (150, 168), (290, 208), (470, 156), (610, 206), (790, 162), (930, 208), (1070, 166), (1200, 204)]
CAPS = [(330, 52), (650, 34), (1090, 70), (870, 86), (110, 118)]   # peaks that carry snow


def poly(pts, fill):
    d = "M0 260L" + "L".join(f"{x} {y}" for x, y in pts) + "L1200 260Z"
    return f'<path d="{d}" fill="{fill}"/>'


def cap(x, y, fill):
    h = 40 if y < 60 else 32   # taller peaks get a taller cap, with a zig-zag lower edge
    w = h * 0.95
    return (f'<path d="M{x} {y}L{x + w:.0f} {y + h}L{x + w * .55:.0f} {y + h - 9}L{x + w * .2:.0f} {y + h + 3}'
            f'L{x - w * .25:.0f} {y + h - 8}L{x - w * .6:.0f} {y + h + 2}L{x - w:.0f} {y + h}Z" fill="{fill}"/>')


def band(back, mid, front, snow, sun):
    s = f'<circle cx="930" cy="112" r="48" fill="{sun}"/>' if sun else ""
    s += poly(BACK, back) + "".join(cap(x, y, snow) for x, y in CAPS) + poly(MID, mid)
    s += f'<path d="M0 260V232C180 206 330 236 520 224S860 206 1010 228S1150 236 1200 232V260Z" fill="{front}"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Mountains"><title>Mountains</title>{s}</svg>\n'


out = ROOT / "brand"
(out / "ghumoco-mountains-light.svg").write_text(band("#2C5A41", "#1B3B2B", "#14291F", "#F5EEE1", "#E8541E"), encoding="utf-8")
(out / "ghumoco-mountains-dark.svg").write_text(band("#3F7656", "#2C5A41", "#224A36", "#F5EEE1", "#FF6A1F"), encoding="utf-8")
print("wrote brand/ghumoco-mountains-*.svg")
# a seamless, sun-less tile for the website hero (repeats sideways at any screen width)
(ROOT / "img" / "hero-range.svg").write_text(band("#2C5A41", "#1B3B2B", "#14291F", "#F5EEE1", None).replace(' role="img" aria-label="Mountains"><title>Mountains</title>', ' aria-hidden="true">').replace('preserveAspectRatio="xMidYMax slice"', ''), encoding="utf-8")
print("wrote img/hero-range.svg")
