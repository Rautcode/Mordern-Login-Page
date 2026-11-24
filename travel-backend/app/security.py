import hmac
import ipaddress
import logging
import time
from collections import defaultdict, deque

from fastapi import Header, HTTPException, Request

from app.config import get_settings

log = logging.getLogger(__name__)
MAX_KEYS = 10_000  # hard bound on limiter memory


def check_admin_key(provided: str | None) -> None:
    expected = get_settings().admin_api_key.get_secret_value().encode()
    if not provided or not hmac.compare_digest(provided.encode(), expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


async def require_admin(x_admin_key: str | None = Header(default=None)) -> None:
    check_admin_key(x_admin_key)


def check_proxy_trust(forwarded_allow_ips: str | None, prod: bool) -> None:
    """Per-IP limits only mean something if the client IP comes from a proxy we trust, and only from that proxy.

    uvicorn trusts X-Forwarded-For only from FORWARDED_ALLOW_IPS (default 127.0.0.1). '*' makes it trust ANY client, so a
    spoofed header gives an attacker unlimited fresh rate-limit buckets: refuse to start that way in production.
    """
    parts = [p.strip() for p in (forwarded_allow_ips or "").split(",") if p.strip()]
    if prod and "*" in parts:
        raise RuntimeError(
            "FORWARDED_ALLOW_IPS=* lets any client spoof X-Forwarded-For and bypass every per-IP limit. "
            "Set it to your proxy's address or CIDR."
        )
    if prod and not parts:
        log.warning(
            "FORWARDED_ALLOW_IPS is not set. If this service runs behind a load balancer, every visitor shares one rate-limit "
            "bucket (a single script could lock everyone out). Set it to the proxy's address or CIDR; see the README."
        )


def client_key(ip: str) -> str:
    """Rate-limit bucket for a client. An IPv6 client controls a whole /64, so bucket on that, not on the single address."""
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return ip
    if addr.version == 6:
        if addr.ipv4_mapped:  # ::ffff:1.2.3.4 is really an IPv4 client
            return str(addr.ipv4_mapped)
        return str(ipaddress.ip_network(f"{addr}/64", strict=False))
    return str(addr)


class RateLimiter:
    """Sliding window per key (client IP by default, or any string such as a phone number).

    ponytail: in-memory, per process. Fine for one container; with several replicas each
    has its own budget. Move to Redis (or Cloudflare rules in front) when you scale out.
    """

    def __init__(self, limit: int, window_s: int):
        self.limit, self.window = limit, window_s
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        q = self.hits[key]
        while q and now - q[0] > self.window:
            q.popleft()
        if len(q) >= self.limit:
            return False
        q.append(now)
        if len(self.hits) > MAX_KEYS:
            self._shrink(now)
        return True

    def _shrink(self, now: float) -> None:
        for k in [k for k, v in self.hits.items() if not v or now - v[-1] > self.window]:
            del self.hits[k]
        if len(self.hits) > MAX_KEYS:  # still over: an active flood. Drop the quietest 10% in one pass so memory stays bounded.
            for k in sorted(self.hits, key=lambda k: self.hits[k][-1])[: MAX_KEYS // 10]:
                del self.hits[k]

    async def __call__(self, request: Request) -> None:
        ip = request.client.host if request.client else "unknown"
        if not self.allow(client_key(ip)):
            raise HTTPException(status_code=429, detail="Too many requests", headers={"Retry-After": str(self.window)})
