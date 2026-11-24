"""Generates the GhumoCo logo files in brand/ (SVG, with the wordmark converted to outlines so no font is needed).
Run from travel-site/:  python3 tools/make_logo.py   (needs fonttools + brotli).  PNG exports: node tools/export_logo.js
The mark is a road shaped like the letter G, ending at a destination dot: it uses the same forest, terracotta and cream as the website."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
FOREST, TERRA, CREAM = "#1B3B2B", "#C85A32", "#F5EEE1"
# the G: a road along a 310-degree arc plus a short crossbar, in a 100x100 box
ROAD = "M68.4 34.6A24 24 0 1 0 74 50L52 50"
DOT = (68.4, 34.6)


def mark(road, centre, dot, tile=None):
    """Mark artwork in a 100x100 box. tile = background colour of a rounded square, or None for no tile."""
    bg = f'<rect width="100" height="100" rx="22" fill="{tile}"/>' if tile else ""
    return (f'{bg}<path d="{ROAD}" fill="none" stroke="{road}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{ROAD}" fill="none" stroke="{centre}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0.1 5.4"/>'
            f'<circle cx="{DOT[0]}" cy="{DOT[1]}" r="7.5" fill="{dot}"/><circle cx="{DOT[0]}" cy="{DOT[1]}" r="2.6" fill="{CREAM if tile else CREAM}"/>')


def wordmark(size, x0, y0):
    f = TTFont(ROOT / "fonts" / "young-serif-latin.woff2")
    gs, cmap, upm = f.getGlyphSet(), f.getBestCmap(), f["head"].unitsPerEm
    sc, x, out = size / upm, x0, []
    for i, ch in enumerate("GhumoCo"):
        g = gs[cmap[ord(ch)]]
        pen = SVGPathPen(gs)
        g.draw(TransformPen(pen, (sc, 0, 0, -sc, x, y0)))
        out.append(f'<path fill="{FOREST if i < 5 else TERRA}" d="{pen.getCommands()}"/>')
        x += g.width * sc
    return "".join(out), x


def svg(w, h, inner, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" role="img" aria-label="{title}"><title>{title}</title>{inner}</svg>\n'


out = ROOT / "brand"
out.mkdir(exist_ok=True)
(out / "ghumoco-mark.svg").write_text(svg(100, 100, mark(CREAM, TERRA, TERRA, tile=FOREST), "GhumoCo"), encoding="utf-8")
(out / "ghumoco-mark-light.svg").write_text(svg(100, 100, mark(FOREST, CREAM, TERRA), "GhumoCo"), encoding="utf-8")
word, end = wordmark(78, 92, 70)
lockup = f'<g transform="translate(2 1) scale(.86)">{mark(FOREST, CREAM, TERRA)}</g>{word}'   # the G is drawn to match the capital height
(out / "ghumoco-logo.svg").write_text(svg(end + 8, 92, lockup, "GhumoCo"), encoding="utf-8")
(ROOT / "favicon.svg").write_text(svg(100, 100, mark(CREAM, TERRA, TERRA, tile=FOREST), "GhumoCo"), encoding="utf-8")
print("wrote brand/*.svg and favicon.svg")
