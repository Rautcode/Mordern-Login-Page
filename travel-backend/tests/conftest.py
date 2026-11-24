"""Test environment, set once before any test module imports the app (settings are read at import).
Values satisfy the production rules in app/config.py: the suite runs with ENV=production, the stricter mode."""
import os

os.environ.update(
    SUPABASE_URL="https://example.supabase.co", SUPABASE_SERVICE_KEY="x", GEMINI_API_KEY="x",
    RAZORPAY_KEY_ID="rzp_test_x", RAZORPAY_KEY_SECRET="x", RAZORPAY_WEBHOOK_SECRET="whsec_test",
    ADMIN_API_KEY="kT9mQ2vXr7LpW4zN8bYc1HdJ6sFg3AeU5oIx0VnM", ENV="production",
    TELEGRAM_BOT_TOKEN="123456:test", TELEGRAM_CHAT_ID="1", CORS_ORIGINS="https://example.com", WHATSAPP_NUMBER="919876543210",
    WHATSAPP_ACCESS_TOKEN="EAAtest-token", WHATSAPP_PHONE_NUMBER_ID="1234567890", WHATSAPP_VERIFY_TOKEN="verify-me-long-random", WHATSAPP_APP_SECRET="app-secret-test",
)
