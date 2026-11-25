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
3. **Build and publish.** (On Vercel instead? Follow `DEPLOY-VERCEL.md`: the repo is already set up for it.) `npm run build`, then upload `dist/` to Cloudflare Pages (direct upload) or Netlify. Both read the generated `_headers`
   (security and cache headers) and `404.html`. The build refuses to finish if any placeholder is left, hides the Udyam badge if you have no number
   yet, and builds a strict Content-Security-Policy that only allows your own scripts.
   The link-preview picture shown on WhatsApp and Instagram is `og-image.png`. It carries no brand name (the build cannot edit a picture), so it stays valid
   for any brand. To change its words or photos, edit `tools/og.html` and run `node tools/make_og.js`.
4. **Set up your channels.** A separate WhatsApp Business number with quick replies and an away message ("replies 7-9 pm"). Submit
   `https://your-domain/sitemap.xml` in Google Search Console. Create a Google Business Profile under your brand name.
5. **Check what the site claims.** It says Rajasthan and Kerala plans come from real trips, that you quote around the customer's budget, and that
   you reply within 24 hours. Only keep a promise you can keep from your evenings and weekends.

## Measure what works (optional, free)
1. In the Cloudflare dashboard open **Web Analytics**, add your site, and copy the token. Put it in `brand.json` as `"analytics_token"` and rebuild.
   That adds Cloudflare's cookie-free beacon to every page, allows exactly Cloudflare's two hosts in the security policy, and adds one honest sentence to
   the privacy page. Leave it empty for no analytics at all. (This was built without network access to Cloudflare: confirm the dashboard shows visits within a day.)
2. It counts **visits and where they came from**. It cannot count enquiries. Your enquiries are the WhatsApp chats that start from the site: each one
   carries a `Source:` line (for example `Source: instagram`) when the visitor arrived through a tagged link or from another website, so you can tell
   which post brought which chat. The leads console shows the same thing once the backend is on.
3. Tag every link you post: `https://your-domain/?utm_source=instagram&utm_medium=bio` (use `reel`, `story`, `whatsapp-status` and so on).
4. Your conversion rate is WhatsApp chats divided by visits. Look at it weekly, and change one thing at a time.

## After every trip: reviews and photos
Real reviews and real faces are the biggest trust gap on the site. They have to be real and the customer has to agree.
- On the last evening, in the trip's WhatsApp group, send: *"Thank you for travelling with us! If you enjoyed it, reply with a line or two about the trip.
  We'd love to show it on our website with your first name and the trip (for example 'Rohan K., 14-person Rajasthan trip'). Reply YES if that is okay."*
  Keep their reply: it is your written permission.
- Add each approved review to `brand.json`, in their own words (never write one yourself):
  `"reviews": [{"quote": "...", "name": "Rohan K.", "meta": "14-person Rajasthan trip · Pune", "consent": true}]`, up to 6.
  The build refuses any review without `"consent": true`, and the reviews section stays hidden until you add one.
- A real photo for a route card (Rajasthan still shows an illustration): `pip install pillow`, then
  `python3 tools/add_route_photo.py rajasthan path/to/photo.jpg --alt "what the photo shows"`. It crops to the right shape, makes both sizes, removes camera
  and GPS data, and swaps the card. Use only photos you took or have permission to use, and ask the people in them.

## Adding more of your own photos and clips
Put your originals (not WhatsApp copies, which are too small) in one folder, then:
```
pip install pillow          # clips also need ffmpeg installed
python3 tools/prep_media.py photo my-photo.jpg reel-temple            # makes img/reel-temple-520.webp
python3 tools/prep_media.py clip my-clip.mp4 temple --start 3 --dur 6 # makes video/temple.webm, .mp4 and a poster image
```
Both re-encode the file, so camera and GPS data are removed, and clips lose their sound and stay under 8 seconds and a small size
(the home page loads about 0.5 MB before anyone scrolls; each clip only downloads when it scrolls into view). Use only media you own, and only people who have said yes.

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
- **Run a real end-to-end in Razorpay test mode before using live keys.** Everything in the automated tests uses fakes, so this is the first time the real Razorpay API and webhook are exercised.
  1. Deploy the API with `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` from Razorpay's **Test mode** (`rzp_test_...`) and a long random `RAZORPAY_WEBHOOK_SECRET`.
  2. In Razorpay (Test mode) add the webhook `https://<api-origin>/api/webhooks/razorpay` with that same secret and the Payment Link events (paid, partially paid, expired, cancelled).
  3. If Turnstile is on, use Cloudflare's published test keys for this run, or leave `TURNSTILE_SECRET` unset (check Cloudflare's docs for the current dummy values).
  4. `cd travel-backend && python scripts/smoke.py https://<api-origin>` creates one lead named "Smoke Test" and one payment link, then waits. Open the link and pay with Razorpay's test UPI id or test card.
  5. Check by hand: the script prints "webhook received"; the Telegram alert arrived; the lead is **paid** in `/admin`; Razorpay shows the webhook delivered with a 200. Also pay a link a second time or let one expire, to see the other statuses behave.
  6. Delete the "Smoke Test" lead. Only then swap in live keys and a live webhook secret, and make one real small payment to yourself and refund it.
- Upload the real blueprint PDFs to the `blueprints` bucket (`rajasthan.pdf`, `kerala.pdf`). Blueprint delivery is currently a Telegram message to
  you with a signed link to forward on WhatsApp. That is why the site says "sent to your WhatsApp after payment".
- Optional: automatic WhatsApp acknowledgement and Day 1 preview via Meta's Cloud API (free to start with Meta's test number). Setup and limits are in
  `travel-backend/README.md`, "WhatsApp". It needs a dedicated business number, so decide that before you register one.
- Open the CI `audit` job output (pip-audit, npm audit) and fix anything high or critical.
- Blueprint and custom-plan checkouts charge fixed server-side amounts and show them on the Razorpay page. Keep that, or switch those two products
  to quote-only.
- **Turn on the bot check before running ads (Cloudflare Turnstile, free).** In the Cloudflare dashboard open Turnstile, add your domain, and copy the
  *site key* and the *secret key*. Set `TURNSTILE_SECRET=<secret key>` on the API, and `"turnstile_site_key": "<site key>"` in `brand.json` (it needs `api_base`), then
  redeploy both. With the secret set, the API refuses any enquiry without a valid token (fail closed: if Cloudflare cannot be reached, it says no). The visitor then
  sees "We couldn't verify the form" and the WhatsApp message with their details, so nothing is lost. With no keys nothing changes. The build adds only
  `challenges.cloudflare.com` to the security policy and one line to the privacy page. Tested against a stubbed widget only: **check it once in a real browser**
  (open the site, fill the form, confirm the enquiry arrives and the browser console shows no blocked-by-CSP error). Turnstile stops bots, not a person typing
  someone else's number; add a WhatsApp OTP later if that becomes a problem.

## Leads console
Open `https://<your-api-domain>/admin` and sign in with `ADMIN_API_KEY`. It lists leads with their source (campaign tag or referrer),
lets you message them on WhatsApp, change status, build a quote (preview first, then save), re-send a paid delivery, and **Export CSV**. The export is exactly what the table shows,
so search or filter first (choose "paid" to get only the people with a trip booked). It holds phone numbers: use it only to plan those trips, and do not add people to broadcast lists or groups without their consent.
The page is served by the API itself (same origin, strict CSP, never indexed); the key lives only in that browser tab.
Keep `ADMIN_API_KEY` long and random, and rotate it if anyone who knew it leaves.
