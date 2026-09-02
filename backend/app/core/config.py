from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables / .env."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Furniture Store API"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # Local development defaults to the file-backed SQLite database also
    # configured in backend/.env. Production deployments (e.g. Render) MUST
    # provide the real database URL through the DATABASE_URL environment
    # variable; nothing is ever hardcoded to a fixed host here.
    DATABASE_URL: str = "sqlite:///./furniture_store.db"
    DATABASE_ECHO: bool = False

    SECRET_KEY: str = "change-me-in-production-please-use-a-long-random-key-0001"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    CORS_ORIGINS: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "https://abdelkhalek-store.onrender.com"
    )

    # Extra origins matched by regex. Render's *.onrender.com hostnames are
    # assigned dynamically (frontend static site + backend web service), so a
    # regex keeps uploaded logos <img> requests working regardless of the exact
    # subdomain without listing every possible origin.
    CORS_ALLOW_ORIGIN_REGEX: str = r"https://.*\.onrender\.com"

    # Directory where uploaded media (logos) are persisted. Local default is
    # backend/uploads/logos (next to the DB file). On Render this can be set to
    # a mounted persistent disk path so logos survive restarts/redeploys.
    MEDIA_ROOT: Path = Path(__file__).resolve().parents[2] / "uploads" / "logos"

    SEED_DEFAULT_PASSWORD: str = "admin1234"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def cors_origin_regex(self) -> str | None:
        return self.CORS_ALLOW_ORIGIN_REGEX.strip() or None


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
