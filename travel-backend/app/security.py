import hmac
import time
from collections import defaultdict, deque

from fastapi import Header, HTTPException, Request

from app.config import get_settings


def check_admin_key(provided: str | None) -> None:
    expected = get_settings().admin_api_key.get_secret_value().encode()
    if not provided or not hmac.compare_digest(provided.encode(), expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


async def require_admin(x_admin_key: str | None = Header(default=None)) -> None:
    check_admin_key(x_admin_key)


class RateLimiter:
    """Sliding window per client IP.

    ponytail: in-memory, per process. Fine for one container; with several replicas each
    has its own budget. Move to Redis (or Cloudflare rules in front) when you scale out.
    """

    def __init__(self, limit: int, window_s: int):
        self.limit, self.window = limit, window_s
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    async def __call__(self, request: Request) -> None:
        ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        q = self.hits[ip]
        while q and now - q[0] > self.window:
            q.popleft()
        if len(q) >= self.limit:
            raise HTTPException(
                status_code=429, detail="Too many requests", headers={"Retry-After": str(self.window)}
            )
        q.append(now)
        if len(self.hits) > 10_000:  # bound memory under IP-rotation abuse
            for k in [k for k, v in self.hits.items() if not v or now - v[-1] > self.window]:
                del self.hits[k]
