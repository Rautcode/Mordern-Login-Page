# Travel site

A static, framework-free site for a Pune group-trip planner: one `index.html` (inline CSS and JS), generated route pages, and a launch kit. No build step is needed to preview it.

```bash
python3 -m http.server 8000      # then open http://localhost:8000
```

## What is where

| Path | Purpose |
|---|---|
| `index.html` | The whole home page: hero, routes, pricing, 3-step planner, FAQ. Placeholders like `[BRAND_NAME]` and `91XXXXXXXXXX` are filled at build time |
| `terms/`, `refunds/`, `privacy/` | Generated from `tools/legal.json`. Drafts written from what the software does: read them, then set `legal_reviewed` in `brand.json` (the build refuses to run without it) |
| `rajasthan-trip-from-pune/`, `kerala-trip-from-pune/` | Generated route landing pages. Do not edit by hand: run `python3 tools/build_routes.py` after changing `tools/routes.json` or the page styles. A new route is one entry in `routes.json` |
| `tools/personalize.py` | Turns the site into a deployable `dist/` with your brand details and a strict CSP |
| `_headers.template` | Security and cache headers (Cloudflare Pages and Netlify read the generated `_headers`) |
| `tests/` | Playwright: `e2e.js`, `a11y.js` (axe), `admin.js` (leads console), `launch.js` (built site under the real CSP) |
| `LAUNCH.md` | Launch checklist, console notes |
| `brand/` | GhumoCo logo files (SVG, plus PNGs for Instagram and WhatsApp profile pictures). Regenerate with `python3 tools/make_logo.py` and `node tools/export_logo.js` |
| `npm run preview` | Builds a preview with the brand name from `tools/brand.example.json` (GhumoCo) and placeholder contact details, and serves it at http://localhost:8080 |
| `DEPLOY-VERCEL.md` | Step-by-step Vercel deploy, with your own domain and a post-launch check list |
| `PILOT.md` | Pilot trip kit: supplier checks, WhatsApp templates, incident protocol |

## Launch in three commands

```bash
cp tools/brand.example.json brand.json   # edit: brand, domain, whatsapp, instagram, founder, legal_name, email, address, legal_reviewed, api_base
npm run build                            # regenerates route pages, then writes ./dist
# upload ./dist as a static site, then add the site origin to the backend's CORS_ORIGINS
```

`personalize.py` refuses to finish while any placeholder is left, so an unfinished brand file cannot ship.

## Test

```bash
npm install && npx playwright install chromium
npm test        # stale-page check, e2e, accessibility (home + route page), admin console, launch/CSP build
```

## Configuration at runtime

The page reads optional `window.SITE_CONFIG` (`whatsapp`, `instagram`, `apiBase`, `pollMs`, `pollMax`, `photos`, `reviews`, `siteUrl`, `refundPolicy`). With no `apiBase` the planner falls back to WhatsApp-only mode, so the site is still usable without the backend.

## Rules this site follows

- No third-party scripts, fonts or trackers: everything is self-hosted, which keeps the CSP strict and the pages fast.
- Customer text is only ever written with `textContent`; the draft saved in the tab never includes the phone number or free-text notes.
- Facts on route pages must exist in the backend knowledge base (a test checks train numbers and phone-like numbers).
- No prices anywhere: every plan is quoted around the customer's budget. A test fails if a price appears on any page.
- Reviews and the Udyam badge stay hidden until real values are supplied.
