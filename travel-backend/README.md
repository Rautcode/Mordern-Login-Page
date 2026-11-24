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

- **One worker per container.** The rate limiter is in memory per process. Scale by adding containers, or move the limiter to Redis or the CDN first.
- **Behind a proxy:** run with `--proxy-headers` and set `FORWARDED_ALLOW_IPS` to the proxy's address, otherwise every visitor shares one IP (and one rate-limit budget).
- `ENV=production` hides `/docs` and `/openapi.json`.
- Set `CORS_ORIGINS` to the exact site origin(s). No wildcard.
- `ADMIN_API_KEY` should be long and random. The admin console is at `/admin` on this service; rotate the key when anyone who knew it leaves.
- Telegram alerts and the WhatsApp links are click-to-chat, not automated sending. Automated WhatsApp needs the WhatsApp Business API.

## Knowledge base rules

Goa and Hampi-Gokarna are still unverified placeholders, so previews for them carry "confirm before travel" notes. Rajasthan and Kerala come from real, operator-checked itineraries. Never put driver, vendor or homestay phone numbers in these files: they are committed to git and sent to an LLM (a test enforces this).

## What is not covered by tests

Gemini, Razorpay and Supabase are exercised only through fakes. Before launch, do one real run in test mode: lead, preview, payment link, signed webhook, delivery.
