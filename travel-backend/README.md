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
- Telegram alerts and WhatsApp links are click-to-chat, not automated sending. Automated WhatsApp needs the WhatsApp Business API.
- Logs: errors may include database row text (names, phone numbers). Treat log storage as personal data.

## Knowledge base rules

Goa and Hampi-Gokarna are still unverified placeholders, so previews for them carry "confirm before travel" notes. Rajasthan and Kerala come from real, operator-checked itineraries. Never put driver, vendor or homestay phone numbers in these files: they are committed to git and sent to an LLM (a test enforces this).

## What is not covered by tests

Gemini, Razorpay and Supabase are exercised only through fakes. Before launch, do one real run in test mode: lead, preview, payment link, signed webhook, delivery.
