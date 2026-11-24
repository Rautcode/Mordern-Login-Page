"""The smoke script is run by a person against a live API, so its own logic is checked here with a fake transport."""
import sys, pathlib, httpx
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "scripts"))
import smoke


def client(handler):
    return httpx.Client(base_url="http://api.test", transport=httpx.MockTransport(handler))


def api(statuses, lead_code=201):
    seen = []
    def h(req):
        seen.append((req.method, req.url.path, req.content))
        p = req.url.path
        if p in ("/health", "/ready"): return httpx.Response(200, json={})
        if p == "/api/leads": return httpx.Response(lead_code, json={"lead_id": "L1"} if lead_code == 201 else {"detail": "x"})
        if p == "/api/create-payment-link": return httpx.Response(200, json={"payment_url": "https://rzp.io/i/x", "amount_inr": 699})
        return httpx.Response(200, json={"status": statuses.pop(0) if len(statuses) > 1 else statuses[0]})
    return h, seen


def test_passes_when_status_turns_paid_and_sends_token():
    h, seen = api(["quoted", "quoted", "paid"]); out = []
    assert smoke.run(client(h), token="XXXX.DUMMY.TOKEN.XXXX", wait=30, sleep=lambda s: None, say=out.append)
    assert b"XXXX.DUMMY.TOKEN.XXXX" in next(c for m, p, c in seen if p == "/api/leads")
    assert any("Telegram" in o for o in out)


def test_fails_when_never_paid_and_when_turnstile_blocks():
    h, _ = api(["quoted"]); assert not smoke.run(client(h), wait=0, sleep=lambda s: None, say=lambda m: None)
    h, _ = api(["quoted"], lead_code=403); out = []
    assert not smoke.run(client(h), say=out.append) and any("--turnstile-token" in o for o in out)
