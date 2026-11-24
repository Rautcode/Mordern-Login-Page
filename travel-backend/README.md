# Travel backend

Async FastAPI service behind the trip-planning site: it takes leads, generates a free Day 1 preview with Gemini, takes payment through Razorpay, and delivers the PDF.

```
site form -> POST /api/leads -> Telegram alert + WhatsApp link
          -> POST /api/generate-preview (Gemini, grounded in app/knowledge_base/*.md) -> preview PDF
          -> POST /api/create-payment-link (amount decided server-side) -> Razorpay
          -> POST /api/webhooks/razorpay (HMAC verified, idempotent) -> full PDF delivered
```

## Layout

| Path | What it holds |
|---|---|
| `app/main.py` | App wiring, CORS, access log, `/health`, `/ready` |
| `app/routers/` | `leads`, `itineraries`, `payments`, `admin` (API), `console` (serves the admin page) |
| `app/services/` | `ai_planner` (Gemini + hallucination guards), `pdf_generator` (Jinja2 + WeasyPrint), `pricing_engine`, `notifier` (Telegram), `rag_loader` |
| `app/knowledge_base/` | Verified route facts (trains, hours, costs). The planner may only use what is written here |
| `app/admin_ui/` | Leads console (`/admin`): static HTML, JS and CSS, strict CSP, no inline code |
| `supabase/schema.sql` | Tables, RLS (on, no policies), private buckets. Contains migration comments for existing databases |
| `tests/` | `test_core.py` (money, validation, guards, PDF), `test_flow.py` (end-to-end against in-memory fakes) |

## Run it

```bash
cp .env.example .env            # fill in every value; startup fails fast if one is missing
pip install -r requirements.txt  # WeasyPrint also needs Pango (see Dockerfile for the apt packages)
uvicorn app.main:app --reload
pytest -q                        # no network or keys needed
```

Apply `supabase/schema.sql` once in the Supabase SQL editor. For an existing database, run the `alter table ... add column` lines from the comments in that file; new optional lead columns are only written when the visitor answered, so leads without them keep working before the migration.

## Production notes

`ENV` defaults to **production** (fail closed: a forgotten setting can never expose `/docs`). Set `ENV=development` on your laptop. In production the app **refuses to start** unless these are set: Telegram token and chat id (a paid-but-failed or underpaid alert must never be dropped silently), `CORS_ORIGINS` (exact origins, never `*`), a real `WHATSAPP_NUMBER`, and an `ADMIN_API_KEY` of 32+ characters with real variety.

- **Rate limits need the real client IP.** Set `FORWARDED_ALLOW_IPS` to your proxy's address or CIDR. Unset behind a load balancer, every visitor shares one bucket (10 leads/hour for the whole site). `*` lets any client spoof `X-Forwarded-For` and bypass every limit, so the app refuses to start with it. After deploying, verify with two requests from different networks (or one with a spoofed header) that they are limited separately.
- **One worker per container.** Limiters are in memory per process. Scale by adding containers, or move them to Redis or the CDN first.
- **Abuse limits** (per IP, per phone number, whole site, per lead, per day) bound spam and Gemini cost. They are a backstop, not proof of ownership: anyone can type someone else's phone number. Before paid ads, set `TURNSTILE_SECRET` (Cloudflare Turnstile) so `POST /api/leads` requires a verified token; it is off until you set it, and fails closed once on. A WhatsApp OTP would additionally prove phone ownership.
- **Webhooks:** point Razorpay at `/api/webhooks/razorpay` and enable `payment_link.paid`, `payment_link.expired` and `payment_link.cancelled`. A link the app replaced is cancelled at Razorpay; if it is paid anyway, the payment is still matched and delivered, and you get an alert.
- Cap request bodies at the proxy (e.g. 1 MB). The app caps the webhook body but reads it whole.
- The admin console is at `/admin` on this service. Rotate `ADMIN_API_KEY` when anyone who knew it leaves.
- Telegram alerts and the website's WhatsApp links are click-to-chat. Automatic WhatsApp replies are optional and come from the Cloud API webhook below.

## WhatsApp (optional automatic replies, free to start)
What it does: the website's "Send on WhatsApp" message carries `Ref: xxxxxxxx`. When the customer sends it, Meta calls `POST /api/webhooks/whatsapp`;
the API checks Meta's signature, finds the lead, and (only if the sender's number is the lead's number) replies with a fixed acknowledgement and
the free Day 1 preview PDF when one exists, then alerts you on Telegram. Unknown senders get one polite fixed reply per day. Refunds, cancellations,
medical or senior-citizen topics, "agent/human", and any media message get one holding reply, pause the bot for that number for 24 hours, and alert you.
**No model writes to customers**: replies are fixed templates, so nothing can promise a price or an inclusion you did not set.
Not built (on purpose): an automatic discount, "only N seats left" or countdown messages (they would be false unless they are real), and an
automatic hour-22 follow-up (needs a scheduler and Meta's template rules; follow up by hand inside the 24-hour window for now).

Setup (about an hour; verify each step against Meta's current docs, which change):
1. developers.facebook.com: create an app (type Business), add the **WhatsApp** product. Meta gives a **test number** you can use free, to message up to 5 numbers you verify. Use it first.
2. Set the four `WHATSAPP_*` variables (`.env.example`): a **permanent System User token** (the 24-hour test token will stop working), the Phone number ID, a long random verify token you invent, and the **App secret** (App settings > Basic).
3. Deploy, then in WhatsApp > Configuration set the callback URL to `https://<api-origin>/api/webhooks/whatsapp` and the same verify token, and **subscribe to the `messages` field**.
4. Send the website's WhatsApp message from a verified test phone using a real lead's ref. Expect the ack, the preview document and a Telegram alert.
5. For real customers you need your own number registered on the Cloud API with an approved display name. **A number registered on the Cloud API generally cannot be used in the normal WhatsApp Business app at the same time** (Meta has been adding a coexistence option; check whether it is available to you). Use a dedicated number, and set `WHATSAPP_NUMBER` (the number the website opens) to that same number.
6. Cost: the Cloud API itself has no subscription. Replies inside the 24-hour window after the customer's message were free when I last checked; message templates you send outside it are charged per message. Meta changed this pricing model in 2025: read the current India pricing page before relying on any figure.
Limits: all state (dedupe, 24-hour pause, one-reply-per-day) is in memory and resets on restart; worst case is one extra reply. The webhook has no automatic reply when the preview is still being generated (you get the alert and send it); if both the website and WhatsApp flows are used, your Telegram will show both alerts.
- Logs: errors may include database row text (names, phone numbers). Treat log storage as personal data.

## Knowledge base rules

Goa and Hampi-Gokarna are still unverified placeholders, so previews for them carry "confirm before travel" notes. Rajasthan and Kerala come from real, operator-checked itineraries. Never put driver, vendor or homestay phone numbers in these files: they are committed to git and sent to an LLM (a test enforces this).

## What is not covered by tests

Gemini, Razorpay and Supabase are exercised only through fakes. Before launch, do one real run in test mode: lead, preview, payment link, signed webhook, delivery.
