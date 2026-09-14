from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "SICP – Societal Innovation Collaboration Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security / JWT
    SECRET_KEY: str = "sicp_super_secret_jwt_key_for_development_replace_in_production_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutes as per SICP Security Rule
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7     # 7 days as per SICP Security Rule
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./sicp.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
