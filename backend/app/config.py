from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./dev.db"
    app_env: str = "development"

    # SECRET: sign JWTs with this. Generate a fresh one for production:
    #   python -c "import secrets; print(secrets.token_urlsafe(48))"
    secret_key: str = "dev-only-change-me-please-this-is-not-secret"
    token_expire_hours: int = 24


settings = Settings()