from functools import lru_cache

from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loaded from env / .env. Missing required values fail startup, not the first request."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "development"
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
    custom_plan_price_inr: int = 2499
    advance_pct: int = 50
    gst_rate_pct: float = 5.0  # confirm with your CA

    @field_validator("admin_api_key")
    @classmethod
    def _strong_admin_key(cls, v: SecretStr) -> SecretStr:
        if len(v.get_secret_value()) < 32:
            raise ValueError("ADMIN_API_KEY must be at least 32 characters")
        return v

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
