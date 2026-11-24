"""Generates the GhumoCo logo files in brand/ (SVG, with text converted to outlines so no font is needed).
Run from travel-site/:  python3 tools/make_logo.py   (needs fonttools + brotli).  PNG exports: node tools/export_logo.js
The mark is a G whose crossbar is a forward arrow ("let's go"). Colours match the website: forest green and a bright orange."""
import math
from pathlib import Path
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
FOREST, ORANGE, BRIGHT, CREAM = "#1B3B2B", "#E8541E", "#FF6A1F", "#F5EEE1"
BOLD = instantiateVariableFont(TTFont(ROOT / "fonts" / "figtree-latin.woff2"), {"wght": 850})   # variable font: pick the heavy weight
HAND = TTFont(ROOT / "fonts" / "caveat-latin.woff2")


def pt(r, deg):
    a = math.radians(deg)
    return 50 + r * math.cos(a), 50 + r * math.sin(a)


def mark(ring, arrow, tile=None):
    """100x100 box: an open ring (the G) with an arrow through the gap."""
    (ax, ay), (bx, by) = pt(25, -64), pt(25, 30)
    bg = f'<rect width="100" height="100" rx="24" fill="{tile}"/>' if tile else ""
    return (f'{bg}<path d="M{ax:.1f} {ay:.1f}A25 25 0 1 0 {bx:.1f} {by:.1f}" fill="none" stroke="{ring}" stroke-width="15" stroke-linecap="round"/>'
            f'<path d="M46 47H70" stroke="{arrow}" stroke-width="13" stroke-linecap="round"/>'
            f'<path d="M68 33L92 47L68 61Z" fill="{arrow}" stroke="{arrow}" stroke-width="5" stroke-linejoin="round"/>')


def text(font, s, size, x0, y0, colors, split):
    gs, cmap, upm = font.getGlyphSet(), font.getBestCmap(), font["head"].unitsPerEm
    sc, x, out = size / upm, x0, []
    for i, ch in enumerate(s):
        g = gs[cmap[ord(ch)]]
        pen = SVGPathPen(gs)
        g.draw(TransformPen(pen, (sc, 0, 0, -sc, x, y0)))
        out.append(f'<path fill="{colors[0] if i < split else colors[1]}" d="{pen.getCommands()}"/>')
        x += g.width * sc
    return "".join(out), x


def svg(w, h, inner, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" role="img" aria-label="{title}"><title>{title}</title>{inner}</svg>\n'


def lockup(ring, arrow, word_colors, tagline=False):
    word, end = text(BOLD, "GhumoCo", 100, 160, 100, word_colors, 5)
    tag = text(HAND, "Chalo, Ghumo!", 44, 164, 158, (arrow, arrow), 99)[0] if tagline else ""
    return svg(end + 10, 170 if tagline else 128, f'<g transform="translate(4 14) scale(1.2)">{mark(ring, arrow)}</g>{word}{tag}', "GhumoCo")


out = ROOT / "brand"
out.mkdir(exist_ok=True)
(out / "ghumoco-mark.svg").write_text(svg(100, 100, mark(CREAM, BRIGHT, tile=FOREST), "GhumoCo"), encoding="utf-8")
(out / "ghumoco-mark-light.svg").write_text(svg(100, 100, mark(FOREST, ORANGE), "GhumoCo"), encoding="utf-8")
(out / "ghumoco-logo.svg").write_text(lockup(FOREST, ORANGE, (FOREST, ORANGE)), encoding="utf-8")
(out / "ghumoco-logo-tagline.svg").write_text(lockup(FOREST, ORANGE, (FOREST, ORANGE), tagline=True), encoding="utf-8")
# colour variants of the horizontal logo and the bare mark
WHITE = "#FFFFFF"
(out / "ghumoco-logo-reversed.svg").write_text(lockup(CREAM, BRIGHT, (CREAM, BRIGHT)), encoding="utf-8")    # for dark backgrounds
(out / "ghumoco-logo-mono.svg").write_text(lockup(FOREST, FOREST, (FOREST, FOREST)), encoding="utf-8")      # one colour: stamps, invoices, embossing
(out / "ghumoco-logo-white.svg").write_text(lockup(WHITE, WHITE, (WHITE, WHITE)), encoding="utf-8")         # over photos
(out / "ghumoco-mark-mono.svg").write_text(svg(100, 100, mark(FOREST, FOREST), "GhumoCo"), encoding="utf-8")
(out / "ghumoco-mark-white.svg").write_text(svg(100, 100, mark(WHITE, WHITE), "GhumoCo"), encoding="utf-8")
(ROOT / "favicon.svg").write_text(svg(100, 100, mark(CREAM, BRIGHT, tile=FOREST), "GhumoCo"), encoding="utf-8")
print("wrote brand/*.svg and favicon.svg")
