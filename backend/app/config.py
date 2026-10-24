"""Application configuration module using Pydantic Settings.

Loads configuration from environment variables or a .env file with safe
defaults for local development.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application runtime settings and environment variables."""

    # Application Environment
    app_env: str = "development"
    debug: bool = True

    # Backend Service
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    # Security & JWT
    secret_key: str = "dev_insecure_jwt_secret_key_shopscale_replace_in_prod"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # MySQL Database Connection Details
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_database: str = "shopscale"
    mysql_user: str = "shopscale_user"
    mysql_password: str = "shopscale_dev_password"
    mysql_root_password: str = "shopscale_root_dev_password"

    # SQLAlchemy Database URLs
    database_url: str = (
        "mysql+aiomysql://shopscale_user:shopscale_dev_password"
        "@localhost:3306/shopscale"
    )
    database_url_sync: str = (
        "mysql+pymysql://shopscale_user:shopscale_dev_password"
        "@localhost:3306/shopscale"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Retrieve cached application settings instance.

    Returns:
        Settings: The instantiated application settings.
    """
    return Settings()
