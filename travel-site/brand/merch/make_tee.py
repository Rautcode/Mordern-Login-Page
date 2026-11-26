"""Generates the GhumoCo full-sleeve tee mockup (front + back) as a self-contained SVG.
Run from travel-site/:  python brand/merch/make_tee.py
Fonts are embedded (base64) so the SVG renders the same everywhere."""
import base64
import pathlib

root = pathlib.Path(__file__).resolve().parents[2]


def b64(name):
    return base64.b64encode((root / "fonts" / name).read_bytes()).decode()


SYNE = b64("syne-normal-700-latin.woff2")
COR = b64("cormorant-garamond-italic-500-latin.woff2")
mount = (root / "brand/ghumoco-mountains-light.svg").read_text()
mount_inner = mount.split("</title>")[1].rsplit("</svg>", 1)[0]
for a, b in [("#2C5A41", "#D2BE96"), ("#1B3B2B", "#C3AC80"), ("#14291F", "#B39C6E"), ("#F5EEE1", "#F3EAD6"), ("#E8541E", "#D9A27A")]:
    mount_inner = mount_inner.replace(a, b)

# Full sleeves: sleeves run down to ribbed cuffs, like a long-sleeve tee.
TEE = ("M215 38 Q300 92 385 38 L452 64 L588 524 L512 552 L440 262 L452 702 "
       "Q300 722 148 702 L160 262 L88 552 L12 524 L148 64 Z")
INDIA = ("M36 4L44 2L52 6L58 12L66 14L72 20L82 24L92 28L98 34L90 36L84 34L78 38L72 36L66 32L60 36"
         "L64 42L62 48L52 52L50 60L46 70L42 80L38 92L34 100L30 92L27 80L24 68L18 58L12 50L14 44"
         "L8 40L4 34L10 30L20 28L24 22L26 14L30 8Z")
CREAM, INK, GREEN, ORANGE = "#EFE6D2", "#111315", "#1B3B2B", "#E8541E"
MARK = ('<path d="M61.0 27.5A25 25 0 1 0 71.7 62.5" fill="none" stroke="#F5EEE1" stroke-width="15" '
        'stroke-linecap="round"/><path d="M46 47H70" stroke="#FF6A1F" stroke-width="13" stroke-linecap="round"/>'
        '<path d="M68 33L92 47L68 61Z" fill="#FF6A1F" stroke="#FF6A1F" stroke-width="5" stroke-linejoin="round"/>')
DASH = f'stroke="{ORANGE}" stroke-width=".9" stroke-dasharray="1.6 1.4" stroke-opacity=".9"'


def cuffs():
    return f"""
  <polygon points="566,450 588,524 512,552 498,494" fill="{INK}"/>
  <polygon points="34,450 12,524 88,552 102,494" fill="{INK}"/>
  <g transform="translate(476 452) rotate(-16.5) scale(.075)">{mount_inner}</g>
  <g transform="translate(30 420) rotate(16.5) scale(.075)">{mount_inner}</g>"""


SHADING = """<rect x="0" y="0" width="600" height="740" fill="url(#shade)"/>
  <path d="M215 120Q250 300 225 560M385 120Q350 300 378 600M300 600Q310 650 296 700" stroke="#000" stroke-opacity=".05" stroke-width="14" fill="none" filter="url(#blur)"/>"""


GRID = "".join(f'<path d="M{x} 50V700"/>' for x in range(190, 420, 38)) + "".join(f'<path d="M150 {y}H450"/>' for y in range(100, 640, 42))


def front_art():
    layers = "".join(
        f'<path d="{INDIA}" transform="translate({t} {t}) scale({s})"/>'
        for t, s in [(-2, 1.04), (-4, 1.08), (-6, 1.12), (-8, 1.16), (7, .88), (13, .76)]
    )
    return f"""
  <g fill="none" stroke="#A89A7C" stroke-linejoin="round">
    <g stroke-width=".5" stroke-opacity=".28">{GRID}</g>
    <g transform="translate(138 80) scale(3.25)">
      <path d="{INDIA}" stroke-width=".7" stroke-opacity=".75"/>
      <g stroke-width=".25" stroke-opacity=".45">{layers}</g>
      <path d="M40 68L36 56L26 44L30 34L38 40" {DASH}/>
      <path d="M40 68L36 82" {DASH}/>
      <path d="M40 68L30 70" {DASH}/>
      <g fill="{ORANGE}" stroke="#fff" stroke-width=".5"><circle cx="40" cy="68" r="2.2"/><circle cx="26" cy="44" r="1.8"/><circle cx="36" cy="82" r="1.8"/><circle cx="30" cy="70" r="1.8"/></g>
    </g>
  </g>
  <g transform="translate(200 128)"><rect width="22" height="22" rx="5" fill="{GREEN}"/><g transform="scale(.22)">{MARK}</g></g>
  <text x="228" y="145" font-family="Syne" font-weight="700" font-size="15" fill="{INK}" letter-spacing="-.3">GhumoCo</text>
  <g transform="translate(380 140)"><circle cx="10" cy="10" r="11" fill="{GREEN}"/><g transform="translate(-0.5 -0.5) scale(.21)">{MARK}</g></g>
  <text transform="translate(388 180) rotate(90)" font-family="Syne" font-weight="700" font-size="13.5" fill="{INK}" letter-spacing="1.2">GROUND-TESTED TRIPS</text>
  <g transform="translate(494 335) rotate(-16.5)"><rect x="-22" y="-10.5" width="44" height="7" fill="{ORANGE}"/><rect x="-22" y="-3.5" width="44" height="7" fill="#F8F3E8"/><rect x="-22" y="3.5" width="44" height="7" fill="{GREEN}"/></g>"""


def back_art():
    return f"""
  <g transform="translate(262 120)"><rect width="76" height="76" rx="18" fill="{GREEN}"/><g transform="scale(.76)">{MARK}</g></g>
  <text x="300" y="262" text-anchor="middle" font-family="Syne" font-weight="700" font-size="40" fill="{INK}" letter-spacing="-1.4">GhumoCo</text>
  <text x="300" y="296" text-anchor="middle" font-family="Cormorant" font-style="italic" font-size="19" fill="{ORANGE}">ground-tested trips, zero guesswork</text>
  <text x="300" y="330" text-anchor="middle" font-family="Syne" font-weight="700" font-size="9" fill="#6B6454" letter-spacing="1.6">PUNE · RAJASTHAN · KERALA · GOA</text>
  <text x="300" y="345" text-anchor="middle" font-family="Syne" font-weight="700" font-size="9" fill="#6B6454" letter-spacing="1.6">HAMPI · GOKARNA · MORE</text>"""


def tee(front):
    neck = "M215 38 Q300 92 385 38" if front else "M215 38 Q300 58 385 38"
    inner = ('<path d="M215 38 Q300 6 385 38 Q300 92 215 38Z" fill="#CFC6B2"/>' if front
             else '<path d="M215 38 Q300 12 385 38 Q300 58 215 38Z" fill="#CFC6B2"/>')
    n = int(front)
    return f"""
<g>
  <defs><clipPath id="c{n}"><path d="{TEE}"/></clipPath></defs>
  <path d="{TEE}" fill="{CREAM}"/>
  <g clip-path="url(#c{n})">
    {cuffs()}
    <g transform="translate(90 618) scale(.34)">{mount_inner}</g>
    {front_art() if front else back_art()}
    {SHADING}
  </g>
  {inner}
  <path d="{neck}" stroke="{INK}" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="{TEE}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.2"/>
</g>"""


svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 860" width="1400" height="860" role="img" aria-label="GhumoCo full-sleeve travel tee, front and back">
<title>GhumoCo full-sleeve tee</title>
<defs>
<style>@font-face{{font-family:Syne;font-weight:700;src:url(data:font/woff2;base64,{SYNE}) format('woff2')}}
@font-face{{font-family:Cormorant;font-style:italic;font-weight:500;src:url(data:font/woff2;base64,{COR}) format('woff2')}}</style>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D6DD"/><stop offset=".62" stop-color="#E8DCC6"/><stop offset="1" stop-color="#D9C4A0"/></linearGradient>
<linearGradient id="shade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
<filter id="blur"><feGaussianBlur stdDeviation="9"/></filter>
</defs>
<rect width="1400" height="860" fill="url(#bg)"/>
<path d="M0 560L140 470L260 540L420 400L560 520L700 380L860 520L1010 430L1150 520L1280 440L1400 520V860H0Z" fill="#B58E6B" opacity=".35"/>
<ellipse cx="350" cy="800" rx="250" ry="22" fill="#000" opacity=".16" filter="url(#blur)"/><ellipse cx="1050" cy="800" rx="250" ry="22" fill="#000" opacity=".16" filter="url(#blur)"/>
<g transform="translate(50 50)">{tee(True)}</g>
<g transform="translate(750 50)">{tee(False)}</g>
<text x="350" y="835" text-anchor="middle" font-family="Syne" font-weight="700" font-size="14" fill="#5A4E3A" letter-spacing="3">FRONT</text>
<text x="1050" y="835" text-anchor="middle" font-family="Syne" font-weight="700" font-size="14" fill="#5A4E3A" letter-spacing="3">BACK</text>
</svg>"""
out = root / "brand/merch/ghumoco-tee-fullsleeve.svg"
out.write_text(svg, encoding="utf-8")
print(out, len(svg))
