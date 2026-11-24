# Launch checklist

Everything below is tested (`npm test`). Your personal details never go into git: `brand.json` and `dist/` are ignored.

## Phase 1 (days 1-2): go live in WhatsApp-only mode
No backend, no payment keys, nothing that can break. The planner sends every enquiry to your WhatsApp, and "buy a blueprint" opens a
WhatsApp order message. You take payment yourself (UPI or bank transfer to your business account) and send the PDF.

1. **Fill in your details**
   ```
   cp tools/brand.example.json brand.json
   ```
   Set `brand`, `domain`, `whatsapp` (digits with country code), `instagram`, `founder`, `legal_name` (as it appears on your Udyam or bank
   account), `email`, `address` (city and state at least), and `udyam` if you have it. Leave `api_base` empty.
2. **Read the legal pages, then approve them.** Build once (`npm run build`), open `dist/terms/`, `dist/refunds/` and `dist/privacy/`, and read
   every promise: the 24-hour delivery, the 50% advance, the refund rules, the 5-7 working day refund time. They are drafts written from what the
   software does. When you agree with every line, set `"legal_reviewed": true` in `brand.json`. The build refuses to run until you do. When you can,
   have a lawyer or CA read them, especially the refund and liability parts.
3. **Build and publish.** `npm run build`, then upload `dist/` to Cloudflare Pages (direct upload) or Netlify. Both read the generated `_headers`
   (security and cache headers) and `404.html`. The build refuses to finish if any placeholder is left, hides the Udyam badge if you have no number
   yet, and builds a strict Content-Security-Policy that only allows your own scripts.
4. **Set up your channels.** A separate WhatsApp Business number with quick replies and an away message ("replies 7-9 pm"). Submit
   `https://your-domain/sitemap.xml` in Google Search Console. Create a Google Business Profile under your brand name.
5. **Check what the site claims.** It says Rajasthan and Kerala plans come from real trips, that you quote around the customer's budget, and that
   you reply within 24 hours. Only keep a promise you can keep from your evenings and weekends.

## What the site does and does not offer today
- **Blueprint PDFs are sold for Rajasthan and Kerala only**, because those are the routes with a finished, real plan. To sell another route: add it to
  `BLUEPRINTS` in `travel-backend/app/services/rag_loader.py`, upload its PDF to the `blueprints` bucket, add it to `BP_ID` and give its card a
  `data-bp` button and postmark in `index.html`. A test fails if the site and the backend disagree.
- **The free Day 1 preview is offered for Rajasthan and Kerala only** (the same two verified plans). Other routes get a hand-built plan, as the page already says ("if your route is covered").
- **Goa and Hampi-Gokarna** show as outlines: "we confirm timings, transfers and stays for your dates before you pay". Upgrade them to "ground-tested"
  only after you have written down a real plan for them.
- **No prices are shown anywhere.** Every plan is quoted around the customer's budget (a test fails if a price appears on any page).
- **Route pages are generated** from `tools/routes.json`, and the Terms, Refund and Privacy pages from `tools/legal.json`. After editing either, run
  `python3 tools/build_routes.py` (`npm test` fails if the committed pages are stale).

## Phase 2 (weeks 2-3): switch the backend on
- Deploy `travel-backend/` (Dockerfile included), set the env vars from `.env.example`, and run `supabase/schema.sql`.
- Set `CORS_ORIGINS=https://your-domain`, put the API origin in `brand.json` as `api_base`, and rebuild `dist/`.
- Razorpay: add `https://api-origin/api/webhooks/razorpay` as the webhook, same secret as `RAZORPAY_WEBHOOK_SECRET`.
- Set `FORWARDED_ALLOW_IPS` (see `travel-backend/README.md`) and confirm two different networks get separate rate-limit budgets.
- Run a real end-to-end in Razorpay test mode: lead, preview, payment link, paid webhook, delivery alert. Everything is tested against fakes only.
- Upload the real blueprint PDFs to the `blueprints` bucket (`rajasthan.pdf`, `kerala.pdf`). Blueprint delivery is currently a Telegram message to
  you with a signed link to forward on WhatsApp. That is why the site says "sent to your WhatsApp after payment".
- Open the CI `audit` job output (pip-audit, npm audit) and fix anything high or critical.
- Blueprint and custom-plan checkouts charge fixed server-side amounts and show them on the Razorpay page. Keep that, or switch those two products
  to quote-only.
- Add Cloudflare Turnstile (or an OTP) to the lead form before running ads.

## Leads console
Open `https://<your-api-domain>/admin` and sign in with `ADMIN_API_KEY`. It lists leads with their source (campaign tag or referrer),
lets you message them on WhatsApp, change status, build a quote (preview first, then save) and re-send a paid delivery.
The page is served by the API itself (same origin, strict CSP, never indexed); the key lives only in that browser tab.
Keep `ADMIN_API_KEY` long and random, and rotate it if anyone who knew it leaves.
