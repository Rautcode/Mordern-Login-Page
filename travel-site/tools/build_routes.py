#!/usr/bin/env python3
"""Generate the static pages: one landing page per route in tools/routes.json, and the legal pages in tools/legal.json,
each as <slug>/index.html (served at /<slug>/).

    python3 tools/build_routes.py          # write the pages
    python3 tools/build_routes.py --check  # exit 1 if a committed page is out of date (CI)

Content comes ONLY from routes.json (which mirrors the verified knowledge-base files). The look comes from index.html's own
<style>, and the lead-source snippet from its own ATTR block, so the pages cannot drift from the home page.
Pages carry the same placeholders as index.html; tools/personalize.py fills them. Standard library only.
"""
import html, json, re, sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
E = html.escape
EXTRA_CSS = """
.rp{padding:132px 0 56px}.rp h1{font-size:clamp(2rem,4.4vw,3.3rem);max-width:24ch;margin:14px 0}.rp .grid{display:grid;grid-template-columns:1fr minmax(240px,340px);gap:44px;align-items:start}
.rp figure{margin:0;transform:rotate(1.2deg);background:#fff;padding:10px 10px 14px;box-shadow:0 18px 30px -18px rgba(31,36,33,.6)}.rp figure img{display:block;width:100%;height:auto}
.rp figcaption{font:600 1.25rem var(--hand);color:var(--terra-d);text-align:center;margin-top:8px}
.glance{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px 22px;margin-top:26px;padding:18px 20px;background:var(--card);border:1px dashed var(--line)}
.glance dt{font:500 .68rem var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.glance dd{font-weight:700}
.rs{padding:56px 0}.rs h2{margin-bottom:22px}
.day{background:var(--card);border:1px solid var(--line);padding:20px 22px;margin-bottom:18px;box-shadow:0 10px 22px -18px rgba(31,36,33,.5)}.day h3{margin:2px 0 12px}
.tl{list-style:none;padding:0;display:grid;gap:10px}.tl li{display:grid;grid-template-columns:104px 1fr;gap:14px}.tl time{font:500 .85rem var(--mono);color:var(--terra-d);padding-top:3px}
.note-box{background:#EAF0E4;border-left:6px solid var(--forest-2);padding:18px 22px;border-radius:4px}.note-box ul{padding-left:20px;display:grid;gap:8px}
.tbl{overflow-x:auto}.tbl table{border-collapse:collapse;width:100%;min-width:640px;font-size:.94rem;background:var(--card)}.tbl th,.tbl td{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}.tbl th{background:var(--forest);color:#fff}
.cta-band{background:var(--forest);color:#F5EEE1;padding:44px 0;text-align:center}.cta-band h2{color:#F5EEE1}.cta-band .cta-row{justify-content:center}.cta-band p{margin:12px auto 0}
.prose{max-width:780px}.prose h1{font-size:clamp(2rem,4.4vw,3rem);margin:14px 0 6px}.prose h2{font-size:1.45rem;margin:34px 0 10px}.prose p,.prose li{max-width:72ch}.prose ul{padding-left:20px;display:grid;gap:7px;margin:8px 0}.prose p{margin:8px 0}.prose a{color:var(--terra-d)}.legal a{text-decoration:none}
.crumbs{font-size:.88rem;color:var(--muted)}.crumbs a{color:var(--forest)}
body{padding-bottom:0}footer{padding-top:70px}
@media(max-width:820px){.rp .grid{grid-template-columns:1fr}.tl li{grid-template-columns:1fr;gap:0}}
"""


def source():
    s = (ROOT / "index.html").read_text(encoding="utf-8")
    css = s.split("<style>", 1)[1].split("</style>", 1)[0].replace("url(fonts/", "url(../fonts/")
    attr = re.search(r"const ATTR = \(\(\) => \{.*?\}\)\(\);", s, flags=re.S).group(0)
    assert "sessionStorage.setItem" in attr, "ATTR block not found in index.html"
    logo = re.search(r'<a href="#top" class="logo"[^>]*>(.*?)</a>', s, flags=re.S).group(1)
    return css, attr, logo


def table(t):
    head = "".join(f'<th scope="col">{E(h)}</th>' for h in t["head"])
    body = "".join("<tr>" + "".join(f"<td>{E(c)}</td>" for c in row) + "</tr>" for row in t["rows"])
    label = E(t["title"]) + ", scrolls sideways on small screens"
    return (f'<section class="rs"><div class="wrap">\n  <h2>{E(t["title"])}</h2><p class="lead" style="margin:0 0 18px">{E(t["note"])}</p>\n'
            f'  <div class="tbl" role="region" aria-label="{label}" tabindex="0"><table><caption class="hand" style="text-align:left;padding-bottom:6px">{E(t["caption"])}</caption>'
            f'<thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>\n</div></section>')


def header(logo, wa, plan, cta="Plan this trip"):
    return f"""<header class="hdr solid">
  <div class="wrap nav">
    <a href="../" class="logo" aria-label="[BRAND_NAME] home">{logo}</a>
    <div class="nav-cta"><a class="btn btn-ghost wa-link" href="{wa}" target="_blank" rel="noopener">WhatsApp</a><a href="{plan}" class="btn btn-primary">{cta}</a></div>
  </div>
</header>"""


def footer(wa):
    return f"""<footer>
  <div class="wrap">
    <div class="f-grid">
      <div><a href="../" class="logo">[BRAND_NAME]</a><p style="margin-top:12px;max-width:42ch">Ground-Tested Trips. Zero Guesswork. Online-first trip planning and booking for travellers across India. Based in Pune, Maharashtra.</p></div>
      <div><h3>More</h3><ul><li><a href="../#routes">All proven routes</a></li><li><a href="../#services">Services</a></li><li><a href="../#faq">FAQ</a></li></ul></div>
      <div><h3>Connect</h3><ul><li><a href="https://www.instagram.com/[INSTAGRAM_HANDLE]" target="_blank" rel="noopener">Instagram @[INSTAGRAM_HANDLE]</a></li><li><a href="{wa}" target="_blank" rel="noopener">WhatsApp us</a></li></ul></div>
    </div>
    <div class="copy"><span>© [BRAND_NAME]. Every plan and quote is built around your budget and confirmed in writing.</span><span class="legal"><a href="../terms/">Terms</a> · <a href="../refunds/">Refunds</a> · <a href="../privacy/">Privacy</a></span></div>
  </div>
</footer>"""


def mbar(wa, plan):
    return f"""<nav class="mbar" aria-label="Quick actions"><a class="btn btn-wa" href="{wa}" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn-primary" href="{plan}">Plan My Trip</a></nav>"""


def head(title, desc, url, css, attr, ld="", og="article"):
    return f"""<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)} | [BRAND_NAME]</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#F5EEE1">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta property="og:type" content="{og}"><meta property="og:locale" content="en_IN"><meta property="og:site_name" content="[BRAND_NAME]">
<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="https://YOUR-DOMAIN.com/og-image.png">
<meta name="twitter:card" content="summary_large_image">
{ld}<link rel="preload" as="font" type="font/woff2" crossorigin href="../fonts/young-serif-latin.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="../fonts/figtree-latin.woff2">
<style>{css}{EXTRA_CSS}</style>
<script>{attr}</script>
</head>"""


def section(s):
    ul = "<ul>" + "".join(f"<li>{E(x)}</li>" for x in s["ul"]) + "</ul>" if s.get("ul") else ""
    return f"<h2>{E(s['h'])}</h2>" + ul + "".join(f"<p>{E(x)}</p>" for x in s.get("p", [])) + s.get("html", "")


def info_page(p, css, attr, logo):
    url = f"https://YOUR-DOMAIN.com/{p['slug']}/"
    wa = f"https://wa.me/91XXXXXXXXXX?text={quote('Hi! I have a question.')}"
    plan = "../#planner"
    return f"""{head(p["title"], p["description"], url, css, attr)}
<body>
<a class="skip" href="#main">Skip to content</a>
{header(logo, wa, plan, "Plan my trip")}
<main id="main">
<section class="rp"><div class="wrap prose">
  <p class="crumbs"><a href="../">Home</a> / {E(p["title"])}</p>
  <h1>{E(p["title"])}</h1>
  <p class="lead">Last updated {E(p["updated"])}</p>
  {"".join(section(s) for s in p["sections"])}
</div></section>
</main>
{footer(wa)}
{mbar(wa, plan)}
</body>
</html>
"""


def page(r, css, attr, logo):
    url = f"https://YOUR-DOMAIN.com/{r['slug']}/"
    wa = f"https://wa.me/91XXXXXXXXXX?text={quote(r['wa'])}"
    plan = f"../?trip={r['key']}#planner"
    ld_faq = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in r["faq"]]}
    ld_trip = {"@context": "https://schema.org", "@type": "TouristTrip", "name": r["title"], "description": r["description"], "touristType": "Group",
               "url": url}   # no offers/price: every trip is quoted
    ld_crumb = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://YOUR-DOMAIN.com/"},
        {"@type": "ListItem", "position": 2, "name": r["name"], "item": url}]}
    ld = "".join(f'<script type="application/ld+json">{json.dumps(o, ensure_ascii=False)}</script>\n' for o in (ld_trip, ld_faq, ld_crumb))
    im = r["image"]
    days = "".join(
        f'<article class="day"><p class="kicker">{E(d["d"])}</p><h3>{E(d["t"])}</h3><ul class="tl">'
        + "".join(f"<li><time>{E(t)}</time><span>{E(x)}</span></li>" for t, x in d["items"]) + "</ul></article>" for d in r["days"])
    fixed = (f'<section class="rs"><div class="wrap"><h2>{E(r["fixed_title"])}</h2><p>{E(r["fixed"])}</p></div></section>'
             if r.get("fixed") else "")
    tables = "\n\n".join(table(t) for t in r["tables"])
    # deadlines/fixed are authored here (trusted, contain <b>); everything else is escaped
    return f"""<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(r["title"])} | [BRAND_NAME]</title>
<meta name="description" content="{E(r["description"])}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#F5EEE1">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article"><meta property="og:locale" content="en_IN"><meta property="og:site_name" content="[BRAND_NAME]">
<meta property="og:title" content="{E(r["title"])}"><meta property="og:description" content="{E(r["description"])}">
<meta property="og:url" content="{url}"><meta property="og:image" content="https://YOUR-DOMAIN.com/og-image.png">
<meta name="twitter:card" content="summary_large_image">
{ld}<link rel="preload" as="font" type="font/woff2" crossorigin href="../fonts/young-serif-latin.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="../fonts/figtree-latin.woff2">
<style>{css}{EXTRA_CSS}</style>
<script>{attr}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{header(logo, wa, plan)}
<main id="main">
<section class="rp"><div class="wrap">
  <p class="crumbs"><a href="../">Home</a> / <a href="../#routes">Proven routes</a> / {E(r["name"])}</p>
  <div class="grid"><div>
    <p class="kicker">{E(r["kicker"])}</p>
    <h1>{E(r["h1"])}</h1>
    <p class="lead">{E(r["intro"])}</p>
    <dl class="glance">{"".join(f"<div><dt>{E(k)}</dt><dd>{E(v)}</dd></div>" for k, v in r["glance"])}</dl>
    <div class="cta-row"><a class="btn btn-primary" href="{plan}">Plan this trip for me</a><a class="btn btn-wa" href="{wa}" target="_blank" rel="noopener">Ask on WhatsApp</a></div>
  </div>
  <figure><img src="{im["src"]}" width="{im["w"]}" height="{im["h"]}" alt="{E(im["alt"])}" fetchpriority="high"><figcaption>{E(im["cap"])}</figcaption></figure></div>
</div></section>

<section class="rs"><div class="wrap"><h2>The route, hour by hour</h2>{days}</div></section>

<section class="rs"><div class="wrap">
  <h2>{E(r["deadlines_title"])}</h2><div class="note-box"><ul>{"".join(f"<li>{d}</li>" for d in r["deadlines"])}</ul></div>
</div></section>

{fixed}

{tables}

<section class="rs"><div class="wrap">
  <h2>{E(r["book_title"])}</h2><ul style="padding-left:20px;display:grid;gap:8px">{"".join(f"<li>{E(b)}</li>" for b in r["book"])}</ul>
</div></section>

<section class="rs"><div class="wrap"><h2>Questions about this route</h2>
{"".join(f'<details name="faq"><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in r["faq"])}
</div></section>

<section class="cta-band"><div class="wrap">
  <h2>Want this fitted to your dates and who is travelling?</h2>
  <p>Free Day 1 preview, a custom quote in 24 hours. Every plan is built around your budget and requirements.</p>
  <div class="cta-row"><a class="btn btn-primary" href="{plan}">Start planning</a><a class="btn btn-wa" href="{wa}" target="_blank" rel="noopener">WhatsApp us</a></div>
</div></section>
</main>
{footer(wa)}
{mbar(wa, plan)}
</body>
</html>
"""


def main():
    css, attr, logo = source()
    routes = json.loads((ROOT / "tools" / "routes.json").read_text(encoding="utf-8"))
    legal = json.loads((ROOT / "tools" / "legal.json").read_text(encoding="utf-8"))
    pages = [(r["slug"], page(r, css, attr, logo)) for r in routes] + [(p["slug"], info_page(p, css, attr, logo)) for p in legal]
    stale = []
    for slug, new in pages:
        out = ROOT / slug / "index.html"
        if "--check" in sys.argv:
            if not out.exists() or out.read_text(encoding="utf-8") != new:
                stale.append(slug)
        else:
            out.parent.mkdir(exist_ok=True)
            out.write_text(new, encoding="utf-8")
            print("wrote", out.relative_to(ROOT))
    if stale:
        sys.exit("out of date (run: python3 tools/build_routes.py): " + ", ".join(stale))


if __name__ == "__main__":
    main()
