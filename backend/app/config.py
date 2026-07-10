from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


from pathlib import Path

_ENV_FILES = (
    Path(__file__).resolve().parent.parent.parent / ".env",
    Path(__file__).resolve().parent.parent / ".env",
    ".env",
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(p) for p in _ENV_FILES if Path(p).exists()] or [".env"],
        case_sensitive=True,
    )

    APP_ENV: str = "development"
    APP_NAME: str = "AltisOne ITP"
    SECRET_KEY: str = "change-me"
    API_V1_PREFIX: str = "/api/v1"

    MONGO_URI: str = "mongodb://localhost:27017/altisonelabz"
    MONGO_DB_NAME: str = "altisonelabz"

    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET: str = "change-me-jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    ALLOWED_ORIGINS: str = (
        "https://altisonelabz.com,"
        "https://admin.altisonelabz.com,"
        "https://lms.altisonelabz.com,"
        "https://mentor.altisonelabz.com,"
        "http://localhost:3000,"
        "http://localhost:3001,"
        "http://localhost:3002,"
        "http://localhost:3003"
    )

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = "noreply@altisonelabz.com"

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    APPLICATION_FEE_PAISE: int = 50000

    FRONTEND_LANDING_URL: str = "http://localhost:3000"
    FRONTEND_ADMIN_URL: str = "http://localhost:3001"
    FRONTEND_LMS_URL: str = "http://localhost:3002"
    FRONTEND_MENTOR_URL: str = "http://localhost:3003"

    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE: int = 10485760
    USE_FAKE_REDIS: bool = False

    @property
    def allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @model_validator(mode="after")
    def validate_production_secrets(self):
        if self.APP_ENV == "production":
            if self.SECRET_KEY in ("change-me", ""):
                raise ValueError("SECRET_KEY must be set in production")
            if self.JWT_SECRET in ("change-me-jwt-secret", "") or len(self.JWT_SECRET) < 32:
                raise ValueError("JWT_SECRET must be at least 32 chars in production")
        return self


settings = Settings()
