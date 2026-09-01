from functools import lru_cache

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

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    SEED_DEFAULT_PASSWORD: str = "admin1234"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
