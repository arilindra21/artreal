from contextvars import ContextVar
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings

# Context variable for per-request API key override
# This allows passing a custom API key through the request chain without modifying function signatures
current_api_key: ContextVar[Optional[str]] = ContextVar('current_api_key', default=None)


def get_current_api_key() -> Optional[str]:
    """Get the current request's API key (user-provided or None for default)"""
    return current_api_key.get()


def set_current_api_key(api_key: Optional[str]) -> None:
    """Set the API key for the current request context"""
    current_api_key.set(api_key)


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "ArtReal"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # API
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./artreal.db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
    ]

    # Gemini-3 Flash API Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_API_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    GEMINI_MODEL: str = "gemini-3-flash-preview"

    # AutoGen Configuration
    AUTOGEN_CACHE_SEED: int = 42
    AUTOGEN_MAX_ROUND: int = 10

    # Projects Storage
    PROJECTS_BASE_DIR: str = "./projects"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # CRITICAL: Convert PROJECTS_BASE_DIR to absolute path to prevent issues
        # when os.chdir() changes the working directory
        self.PROJECTS_BASE_DIR = str(Path(self.PROJECTS_BASE_DIR).resolve())

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
