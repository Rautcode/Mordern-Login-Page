"""Razorpay test-mode smoke test against a DEPLOYED API. Usage:
  python scripts/smoke.py https://api.example.com [--turnstile-token XXXX.DUMMY.TOKEN.XXXX] [--wait 300]
It creates ONE real lead (name "Smoke Test") and one payment link, prints the link, and waits for you to pay it in
Razorpay TEST mode. Run it only with rzp_test_ keys; delete the lead afterwards from the leads console / Supabase."""
import argparse, sys, time
import httpx

LEAD = {"name": "Smoke Test", "phone": "919999999999", "destination": "Kerala", "service": "blueprint", "website": ""}


def run(client: httpx.Client, token: str | None = None, wait: int = 300, sleep=time.sleep, say=print) -> bool:
    for path in ("/health", "/ready"):
        r = client.get(path)
        if r.status_code != 200:
            say(f"FAIL {path}: {r.status_code} {r.text[:200]}"); return False
        say(f"ok   {path}")
    r = client.post("/api/leads", json={**LEAD, **({"turnstile_token": token} if token else {})})
    if r.status_code != 201:
        say(f"FAIL lead: {r.status_code} {r.text[:200]}" + ("  (Turnstile is on: pass --turnstile-token, see LAUNCH.md)" if r.status_code == 403 else "")); return False
    lead = r.json()["lead_id"]; say(f"ok   lead {lead}")
    r = client.post("/api/create-payment-link", json={"lead_id": lead, "kind": "blueprint", "blueprint_id": "kerala"})
    if r.status_code != 200:
        say(f"FAIL payment link: {r.status_code} {r.text[:200]}"); return False
    url = r.json()["payment_url"]
    say(f"ok   payment link (amount Rs {r.json().get('amount_inr')}): {url}\n     Open it, pay with test UPI success@razorpay (or a Razorpay test card). Waiting up to {wait}s for the webhook...")
    end = time.monotonic() + wait
    while time.monotonic() < end:
        s = client.get(f"/api/leads/{lead}/status").json().get("status")
        if s in ("paid", "delivered"):
            say(f"ok   webhook received, lead is '{s}'.\n     Now check by hand: the Telegram alert arrived; the lead shows as paid in /admin; the Razorpay dashboard shows the webhook delivered (200)."); return True
        sleep(3)
    say("FAIL no 'paid' status in time: check the webhook URL/secret/events in Razorpay and the API logs"); return False


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("api"); ap.add_argument("--turnstile-token"); ap.add_argument("--wait", type=int, default=300)
    a = ap.parse_args()
    with httpx.Client(base_url=a.api.rstrip("/"), timeout=20) as c:
        sys.exit(0 if run(c, a.turnstile_token, a.wait) else 1)
