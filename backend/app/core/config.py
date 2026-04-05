"""Application configuration and settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    DATABASE_URL: str

    OPENAI_API_KEY: str
    OPENAI_LLM_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_EMBEDDING_DIMENSIONS: int = 1536

    SMART_SEARCH_EMBEDDING_WEIGHT: float = 0.7
    SMART_SEARCH_QUALITY_WEIGHT: float = 0.3
    SEARCH_PARSE_MAX_CHARS: int = 200

    APP_TITLE: str = "Homey API"
    APP_VERSION: str = "1.0.0"
    CORS_ORIGINS: str = "http://localhost:5173"

    LOG_JSON_OUTPUT: bool = False


settings = Settings()  # type: ignore[call-arg]
