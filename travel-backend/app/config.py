from functools import lru_cache

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loaded from env / .env. Missing required values fail startup, not the first request."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "production"  # fail closed: forgetting ENV must never expose /docs. Set ENV=development locally.
    cors_origins: str = ""  # comma-separated

    supabase_url: str
    supabase_service_key: SecretStr
    storage_bucket: str = "itineraries"
    blueprint_bucket: str = "blueprints"

    gemini_api_key: SecretStr
    gemini_model: str = "gemini-2.5-flash"
    gemini_timeout_s: int = 90
    max_daily_generations: int = 100

    razorpay_key_id: str
    razorpay_key_secret: SecretStr
    razorpay_webhook_secret: SecretStr
    razorpay_callback_url: str | None = None

    admin_api_key: SecretStr

    telegram_bot_token: SecretStr | None = None
    telegram_chat_id: str | None = None

    whatsapp_number: str = "91XXXXXXXXXX"
    brand_name: str = "Ground-Tested Trips"
    custom_plan_price_inr: int = Field(default=2499, ge=1)
    advance_pct: int = Field(default=50, ge=1, le=100)
    gst_rate_pct: float = Field(default=5.0, ge=0, le=28)  # confirm with your CA

    @field_validator("env")
    @classmethod
    def _known_env(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in ("production", "development"):
            raise ValueError("ENV must be 'production' or 'development'")
        return v

    @field_validator("cors_origins")
    @classmethod
    def _no_wildcard_cors(cls, v: str) -> str:
        if "*" in [o.strip() for o in v.split(",")]:
            raise ValueError("CORS_ORIGINS must list exact origins, not '*'")
        return v

    @field_validator("admin_api_key")
    @classmethod
    def _strong_admin_key(cls, v: SecretStr) -> SecretStr:
        key = v.get_secret_value()
        if len(key) < 32 or len(set(key)) < 12:
            raise ValueError("ADMIN_API_KEY must be at least 32 characters with real variety. Generate one: python -c \"import secrets; print(secrets.token_urlsafe(48))\"")
        return v

    @model_validator(mode="after")
    def _production_must_be_complete(self):
        if self.env != "production":
            return self
        problems = []
        if not (self.telegram_bot_token and self.telegram_bot_token.get_secret_value() and self.telegram_chat_id):
            problems.append("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (paid-but-failed and underpayment alerts must never be dropped silently)")
        if not self.cors_list:
            problems.append("CORS_ORIGINS (the exact site origin)")
        if not (self.whatsapp_number.isascii() and self.whatsapp_number.isdigit() and 11 <= len(self.whatsapp_number) <= 15):
            problems.append("WHATSAPP_NUMBER (digits only with country code, not the placeholder)")
        if problems:
            raise ValueError("ENV=production requires: " + "; ".join(problems))
        return self

    @field_validator("razorpay_webhook_secret")
    @classmethod
    def _webhook_secret_set(cls, v: SecretStr) -> SecretStr:
        if not v.get_secret_value():
            raise ValueError("RAZORPAY_WEBHOOK_SECRET must not be empty (webhooks would be forgeable)")
        return v

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_prod(self) -> bool:
        return self.env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
