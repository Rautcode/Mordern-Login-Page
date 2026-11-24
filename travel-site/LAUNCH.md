# Launch checklist

Everything below is tested (`npm test`). Your personal details never go into git: `brand.json` and `dist/` are ignored.

## 1. Fill in your details
```
cp tools/brand.example.json brand.json     # edit: brand, domain, whatsapp, instagram, founder, udyam, api_base
python3 tools/personalize.py brand.json    # writes ./dist
# Route landing pages (/rajasthan-trip-from-pune/ ...) are generated from tools/routes.json.
# After editing routes.json or index.html's styling run:  python3 tools/build_routes.py
# (npm test fails if the committed pages are out of date; `npm run build` regenerates them first.)
```
It refuses to finish if any placeholder is left, hides the Udyam badge if you have no number yet, and builds a strict
Content-Security-Policy that only allows your own scripts. Leave `api_base` empty for WhatsApp-only mode.

## 2. Publish `dist/` as a static site
Cloudflare Pages (direct upload) or Netlify both read the generated `_headers` (security + cache headers) and `404.html`.

## 3. Backend (when you want the preview, payment and lead-tracking flow)
- Deploy `travel-backend/` (Dockerfile included), set the env vars from `.env.example`, run `supabase/schema.sql`.
- Set `CORS_ORIGINS=https://your-domain`, and put the API origin in `brand.json` as `api_base`, then rebuild `dist/`.
- Razorpay: add `https://api-origin/api/webhooks/razorpay` as the webhook, same secret as `RAZORPAY_WEBHOOK_SECRET`.

## 4. Before you tell anyone
- Send a test lead and a test payment (Razorpay test mode); confirm the Telegram alert arrives.
- Replace anything marked sample: reviews (`SITE_CONFIG.reviews`), the Goa and Hampi-Gokarna notes, the Rajasthan card art.
- Have the privacy text reviewed, and decide your refund policy before enabling `SITE_CONFIG.refundPolicy`.

## Leads console
Open `https://<your-api-domain>/admin` and sign in with `ADMIN_API_KEY`. It lists leads with their source (campaign tag or referrer),
lets you message them on WhatsApp, change status, build a quote (preview first, then save) and re-send a paid delivery.
The page is served by the API itself (same origin, strict CSP, never indexed); the key lives only in that browser tab.
Keep `ADMIN_API_KEY` long and random, and rotate it if anyone who knew it leaves.

## Flight fare hint (refresh monthly)
The planner shows "Flights: from about ₹X per person" for Pune/Mumbai to Jaipur, Kochi and Goa when the visitor picks flight.
The numbers live in `fares.json` only. To refresh: for each route search a round trip on a mid-range date on two fare sites,
put the LOWEST typical economy round-trip fare (rounded down to the nearest 500) in `from_inr`, write what you used in `basis`
and the page in `source`, then set `as_of` to today. If `as_of` is older than `max_age_days` (30) the hint hides itself, so a
stale price can never reach a customer. Add a city or airport by editing `origins`, `destinations` and `routes`; no code change.
These are floors, not quotes: the copy tells visitors that peak dates cost more and that the quote has the exact fare.

## Before you point real traffic at it
1. Backend: set `FORWARDED_ALLOW_IPS` (see `travel-backend/README.md`) and confirm two different networks get separate rate-limit budgets.
2. Run a real end-to-end in Razorpay test mode: lead, preview, payment link, paid webhook, delivery alert. Everything is tested against fakes only.
3. Open the CI `audit` job output (pip-audit, npm audit) and fix anything high or critical.
4. Upload the real blueprint PDFs to the `blueprints` bucket (`rajasthan.pdf`, `kerala.pdf`, `goa.pdf`, `hampi-gokarna.pdf`). Blueprint delivery is currently a Telegram message to you with a signed link to forward on WhatsApp; the site says "sent to your WhatsApp after payment" for that reason.
5. Add Cloudflare Turnstile (or an OTP) to the lead form before running ads.

