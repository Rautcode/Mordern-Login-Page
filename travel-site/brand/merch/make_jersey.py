"""GhumoCo "Ground-Tested Expedition Jersey": print-ready flat panels (full sleeve, sublimation).

Run from travel-site/:  python brand/merch/make_jersey.py
Writes brand/merch/jersey/:
  print/<panel>.svg   clean artwork incl. 1.5 cm bleed, real size in cm, no guides   -> send this
  proof/<panel>.svg   same + cut line (magenta) and bleed line (cyan), for checking
  overview.svg        all panels on one sheet
Sizes are a generic unisex M long-sleeve cut (cm). CONFIRM against Qikink's size chart / template
before ordering and edit the SIZE block if their cut differs. Fonts are embedded.
"""
import base64
import pathlib

root = pathlib.Path(__file__).resolve().parents[2]
out = root / "brand/merch/jersey"
(out / "print").mkdir(parents=True, exist_ok=True)
(out / "proof").mkdir(parents=True, exist_ok=True)


def b64(name):
    return base64.b64encode((root / "fonts" / name).read_bytes()).decode()


FONTS = (f"@font-face{{font-family:Syne;font-weight:700;src:url(data:font/woff2;base64,{b64('syne-normal-700-latin.woff2')}) format('woff2')}}"
         f"@font-face{{font-family:Cormorant;font-style:italic;font-weight:500;src:url(data:font/woff2;base64,{b64('cormorant-garamond-italic-500-latin.woff2')}) format('woff2')}}")

CREAM, SAND, INK, GREEN, GREEN2, ORANGE, GRID = "#EFE6D2", "#D9CBA6", "#111315", "#1B3B2B", "#2C5A41", "#E8541E", "#A89A7C"
BLEED = 1.5      # cm
PX_CM = 59.055   # 150 dpi
M = 3.0          # artboard margin around the cut shape (cm) so the bleed is never clipped

# ---- SIZE (cm, finished garment, flat) ----
BODY_W, BODY_H = 52, 70
SLV_TOP_W, SLV_WR_W, SLV_LEN, SLV_CAP = 23, 10, 57, 13
CUFF_W, CUFF_H = 22, 7
COLLAR_W, COLLAR_H = 50, 5

INDIA = ("M36 4L44 2L52 6L58 12L66 14L72 20L82 24L92 28L98 34L90 36L84 34L78 38L72 36L66 32L60 36"
         "L64 42L62 48L52 52L50 60L46 70L42 80L38 92L34 100L30 92L27 80L24 68L18 58L12 50L14 44"
         "L8 40L4 34L10 30L20 28L24 22L26 14L30 8Z")
MARK = ('<path d="M61.0 27.5A25 25 0 1 0 71.7 62.5" fill="none" stroke="#F5EEE1" stroke-width="15" stroke-linecap="round"/>'
        '<path d="M46 47H70" stroke="#FF6A1F" stroke-width="13" stroke-linecap="round"/>'
        '<path d="M68 33L92 47L68 61Z" fill="#FF6A1F" stroke="#FF6A1F" stroke-width="5" stroke-linejoin="round"/>')
mount = (root / "brand/ghumoco-mountains-light.svg").read_text()
MOUNT = mount.split("</title>")[1].rsplit("</svg>", 1)[0]
for a, b in [("#2C5A41", "#D2BE96"), ("#1B3B2B", "#C3AC80"), ("#14291F", "#B39C6E"), ("#F5EEE1", "#F3EAD6"), ("#E8541E", "#D9A27A")]:
    MOUNT = MOUNT.replace(a, b)


def mark(x, y, s, rounded=True):
    r = 24 if rounded else 0
    return f'<g transform="translate({x} {y}) scale({s/100})"><rect width="100" height="100" rx="{r}" fill="{GREEN}"/>{MARK}</g>'


def grid(w, h, step=5):
    p = "".join(f'<path d="M{x} -5V{h+5}"/>' for x in range(0, int(w) + 1, step)) + "".join(f'<path d="M-5 {y}H{w+5}"/>' for y in range(0, int(h) + 1, step))
    return f'<g stroke="{GRID}" stroke-width=".06" stroke-opacity=".3" fill="none">{p}</g>'


def topo(tx, ty, sc):
    layers = "".join(f'<path d="{INDIA}" transform="translate({t} {t}) scale({s})"/>' for t, s in
                     [(-2, 1.04), (-4, 1.08), (-6, 1.12), (-8, 1.16), (-10, 1.2), (7, .88), (13, .76), (19, .64)])
    dash = f'stroke="{ORANGE}" stroke-width="1.1" stroke-dasharray="2 1.6" stroke-linecap="round"'
    return f"""<g transform="translate({tx} {ty}) scale({sc})" fill="none" stroke="{GRID}" stroke-linejoin="round">
      <path d="{INDIA}" stroke-width=".9" stroke-opacity=".85"/><g stroke-width=".28" stroke-opacity=".5">{layers}</g>
      <path d="M40 68L36 56L26 44L30 34L38 40" {dash}/><path d="M40 68L36 82" {dash}/><path d="M40 68L30 70" {dash}/>
      <g fill="{ORANGE}" stroke="#fff" stroke-width=".5"><circle cx="40" cy="68" r="2.4"/><circle cx="26" cy="44" r="2"/><circle cx="36" cy="82" r="2"/><circle cx="30" cy="70" r="2"/></g></g>"""


def badge(cx, cy, s):
    """Rounded mountain-triangle badge (GhumoCo palette)."""
    h = s * 0.92
    tri = f"M{cx} {cy-h*0.58} L{cx+s/2} {cy+h*0.42} L{cx-s/2} {cy+h*0.42} Z"
    k = s / 100
    return f"""<g>
  <defs><clipPath id="bt{int(cx)}{int(cy)}"><path d="{tri}"/></clipPath></defs>
  <path d="{tri}" fill="{GREEN}" stroke="{GREEN}" stroke-width="{s*0.07}" stroke-linejoin="round"/>
  <g clip-path="url(#bt{int(cx)}{int(cy)})"><g transform="translate({cx-s/2} {cy-h*0.58}) scale({k})">
    <rect width="100" height="100" fill="#F5A623"/><circle cx="70" cy="40" r="11" fill="{ORANGE}"/>
    <path d="M0 100V62L24 40L40 52L58 22L84 52L100 44V100Z" fill="{GREEN2}"/>
    <path d="M58 22L70 38L62 34L58 40L52 34L46 38Z" fill="#F5EEE1"/>
    <path d="M0 100V76L30 60L55 74L80 58L100 70V100Z" fill="{GREEN}"/>
    <path d="M0 100V88L20 80L40 90L70 78L100 88V100Z" fill="#14291F"/>
  </g></g>
  <path d="{tri}" fill="none" stroke="{GREEN}" stroke-width="{s*0.045}" stroke-linejoin="round"/></g>"""


def yoke(w, drop, neck):
    return f'<path d="M-6 -2H{w+6}V{drop}Q{w/2} {drop+3.2} -6 {drop}Z" fill="{GREEN}"/><path d="M-6 {drop-.1}Q{w/2} {drop+3.1} {w+6} {drop-.1}" stroke="{ORANGE}" stroke-width=".55" fill="none"/>'


def text(x, y, s, size, fill=INK, anchor="middle", font="Syne", extra=""):
    st = ' font-style="italic"' if font == "Cormorant" else ""
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="{font}" font-weight="{500 if font == "Cormorant" else 700}"{st} font-size="{size}" fill="{fill}" {extra}>{s}</text>'


# ---------------- panels: (outline path, width, height, artwork) ----------------
def body_outline(front):
    neck = "Q26 11 35 0" if front else "Q26 2.8 35 0"
    return f"M17 0 {neck} L49 3 Q53 12 52 24 L52 70 Q26 72.2 0 70 L0 24 Q-1 12 3 3 Z"


def body_art(front):
    w, h = BODY_W, BODY_H
    a = [f'<rect x="-6" y="-6" width="{w+12}" height="{h+12}" fill="{CREAM}"/>', grid(w, h)]
    a.append(f'<g transform="translate(-3 {h+2.4-12.3}) scale(0.0483)" opacity=".95">{MOUNT}</g>')
    # dark side panels (reference 3: colour-blocked sides)
    side = f'M-6 20L5.2 26Q7.2 47 4.8 {h+3}L-6 {h+3}Z'
    a.append(f'<path d="{side}" fill="{GREEN}"/><path d="M5.2 26Q7.2 47 4.8 {h+3}" stroke="{ORANGE}" stroke-width=".5" fill="none"/>')
    a.append(f'<g transform="translate({w} 0) scale(-1 1)"><path d="{side}" fill="{GREEN}"/><path d="M5.2 26Q7.2 47 4.8 {h+3}" stroke="{ORANGE}" stroke-width=".5" fill="none"/></g>')
    a.append(yoke(w, 5.0 if front else 6.0, front))
    if front:
        a.append(topo(5.6, 19.5, .33))
        a.append(mark(9.6, 12.2, 3.4) + text(13.6, 14.9, "GhumoCo", 2.6, anchor="start"))
        a.append(f'<g transform="translate(38.6 13.2)"><circle cx="1.9" cy="1.9" r="2.1" fill="{GREEN}"/><g transform="translate(.1 .1) scale(.036)">{MARK}</g></g>')
        a.append(f'<text transform="translate(41.6 19.5) rotate(90)" font-family="Syne" font-weight="700" font-size="1.9" fill="{INK}" textLength="26" lengthAdjust="spacing">GROUND-TESTED TRIPS</text>')
    else:
        a.append(f'<path d="M9.5 30Q7.5 44 9.5 62M42.5 30Q44.5 44 42.5 62" fill="none" stroke="{ORANGE}" stroke-width=".35" stroke-dasharray=".1 .9" stroke-linecap="round"/>')
        a.append(f'<text x="26" y="20" text-anchor="middle" font-family="Syne" font-weight="700" font-size="7.6" fill="{INK}" textLength="38" lengthAdjust="spacingAndGlyphs">YOUR NAME</text>')
        a.append(badge(26, 34.5, 14))
        a.append(text(26, 44.7, "GHUMOCO", 2.1, extra='letter-spacing=".4"'))
        a.append(text(26, 48.2, "ground-tested trips, zero guesswork", 1.9, fill=ORANGE, font="Cormorant"))
        for i, lab in enumerate(["RAJASTHAN", "KERALA", "GOA", "HAMPI · GOKARNA"]):
            y = 50.8 + i * 3.4
            a.append(f'<rect x="17.5" y="{y}" width="17" height="2.6" rx="1.3" fill="none" stroke="{INK}" stroke-width=".14"/>')
            a.append(text(26, y + 1.83, lab, 1.2, extra='letter-spacing=".12"'))
    return "".join(a)


def sleeve_outline():
    w, wr, L, c = SLV_TOP_W, SLV_WR_W, SLV_LEN, SLV_CAP
    o = (w - wr) / 2
    return f"M0 {c} Q{w/2} {-c*0.18} {w} {c} L{w-o} {L} L{o} {L} Z"


def sleeve_art(right):
    w, L = SLV_TOP_W, SLV_LEN
    a = [f'<rect x="-6" y="-6" width="{w+12}" height="{L+12}" fill="{CREAM}"/>', grid(w, L)]
    a.append(f'<rect x="-6" y="33" width="{w+12}" height="{L-33+8}" fill="{GREEN}"/><rect x="-6" y="33" width="{w+12}" height=".7" fill="{ORANGE}"/>')
    a.append(f'<g transform="translate({-1} 25.6) scale(0.0302)" opacity=".9">{MOUNT}</g>')
    if right:
        a.append(f'<g transform="translate({w/2} 20) rotate(0)"><rect x="-6" y="-2.1" width="12" height="1.4" fill="{ORANGE}"/><rect x="-6" y="-.7" width="12" height="1.4" fill="#F8F3E8" stroke="{GRID}" stroke-width=".05"/><rect x="-6" y=".7" width="12" height="1.4" fill="{GREEN}"/></g>')
        a.append(f'<g transform="translate({w/2-2.1} 41)">{mark(0, 0, 4.2)}</g>')
    else:
        a.append(f'<text transform="translate({w/2+1} 14) rotate(90)" font-family="Syne" font-weight="700" font-size="1.9" fill="{INK}" textLength="11" lengthAdjust="spacing">GHUMOCO</text>')
        a.append(f'<text transform="translate({w/2+0.9} 41) rotate(90)" font-family="Syne" font-weight="700" font-size="1.4" fill="#F5EEE1" textLength="14" lengthAdjust="spacing">GROUND-TESTED</text>')
    return "".join(a)


def cuff_art():
    w, h = CUFF_W, CUFF_H
    return f'<rect x="-6" y="-6" width="{w+12}" height="{h+12}" fill="{INK}"/><rect x="-6" y="{h/2-.3}" width="{w+12}" height=".6" fill="{ORANGE}"/>'


def collar_art():
    w, h = COLLAR_W, COLLAR_H
    t = "".join(f'<text x="{x}" y="{h/2+0.5}" font-family="Syne" font-weight="700" font-size="1.4" fill="#F5EEE1" textLength="8.5" lengthAdjust="spacing">GHUMOCO</text><circle cx="{x+10.3}" cy="{h/2-.1}" r=".35" fill="{ORANGE}"/>' for x in range(1, int(w) - 8, 12))
    return f'<rect x="-6" y="-6" width="{w+12}" height="{h+12}" fill="{INK}"/><rect x="-6" y="{h-.7}" width="{w+12}" height=".7" fill="{ORANGE}"/>{t}'


def rect_outline(w, h):
    return f"M0 0H{w}V{h}H0Z"


PANELS = {
    "front": (body_outline(True), BODY_W, BODY_H + 2.5, lambda: body_art(True)),
    "back": (body_outline(False), BODY_W, BODY_H + 2.5, lambda: body_art(False)),
    "sleeve-left": (sleeve_outline(), SLV_TOP_W, SLV_LEN, lambda: sleeve_art(False)),
    "sleeve-right": (sleeve_outline(), SLV_TOP_W, SLV_LEN, lambda: sleeve_art(True)),
    "cuff-x2": (rect_outline(CUFF_W, CUFF_H), CUFF_W, CUFF_H, cuff_art),
    "collar": (rect_outline(COLLAR_W, COLLAR_H), COLLAR_W, COLLAR_H, collar_art),
}


def panel_group(name, proof, idn=""):
    d, w, h, art = PANELS[name]
    mid = f"m{name}{idn}"
    g = f"""<defs><mask id="{mid}" maskUnits="userSpaceOnUse" x="-{M}" y="-{M}" width="{w+2*M}" height="{h+2*M}">
      <rect x="-{M}" y="-{M}" width="{w+2*M}" height="{h+2*M}" fill="#000"/>
      <path d="{d}" fill="#fff" stroke="#fff" stroke-width="{BLEED*2}" stroke-linejoin="round"/></mask></defs>
      <g mask="url(#{mid})">{art()}</g>"""
    if proof:
        g += (f'<path d="{d}" fill="none" stroke="#ff00cc" stroke-width=".12" stroke-dasharray=".6 .4"/>'
              f'<path d="{d}" fill="none" stroke="#00b7ff" stroke-width=".08" transform="translate({w/2} {h/2}) scale({1+2*BLEED/w} {1+2*BLEED/h}) translate({-w/2} {-h/2})" opacity=".0"/>'
              f'<text x="0" y="{h+M-.8}" font-family="Syne" font-size="1.3" fill="#ff00cc">{name}  {w:g} x {h:g} cm  (+{BLEED} cm bleed, magenta = cut line)</text>')
    return g, w + 2 * M, h + 2 * M


def svg_panel(name, proof):
    g, W, H = panel_group(name, proof)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W*PX_CM:.0f}" height="{H*PX_CM:.0f}" viewBox="{-M} {-M} {W} {H}">'
            f'<title>GhumoCo jersey {name} - {W:g} x {H:g} cm artboard @150dpi</title><style>{FONTS}</style>{g}</svg>')


for n in PANELS:
    (out / "print" / f"{n}.svg").write_text(svg_panel(n, False), encoding="utf-8")
    (out / "proof" / f"{n}.svg").write_text(svg_panel(n, True), encoding="utf-8")

# overview sheet
pos = {"front": (0, 0), "back": (60, 0), "sleeve-left": (120, 0), "sleeve-right": (150, 0), "cuff-x2": (120, 64), "collar": (120, 78)}
parts = []
for n, (x, y) in pos.items():
    g, W, H = panel_group(n, False, "o")
    parts.append(f'<g transform="translate({x+3} {y+5})">{g}<text x="0" y="-2.4" font-family="Syne" font-size="1.6" fill="#5A4E3A">{n.upper()}</text></g>')
(out / "overview.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1100" viewBox="0 0 182 90"><style>{FONTS}</style>'
    f'<rect width="182" height="90" fill="#E4DCCB"/>{"".join(parts)}</svg>', encoding="utf-8")
print("ok", sorted(p.name for p in (out / "print").iterdir()))
