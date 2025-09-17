from pydantic import BaseSettings, Field, validator
from typing import List, Optional

class Settings(BaseSettings):
    # --- DB ---
    DATABASE_URL: str = Field(default="postgresql+psycopg2://fono:password@db:5432/fonoapp")
    DB_POOL_SIZE: int = Field(default=5)
    DB_MAX_OVERFLOW: int = Field(default=10)
    DB_POOL_RECYCLE: int = Field(default=1800)  # 30 min
    DB_POOL_TIMEOUT: int = Field(default=30)    # 30 s
    SQLALCHEMY_ECHO: bool = Field(default=False)

    # --- JWT ---
    JWT_SECRET: str = Field(default="CHANGE_ME_SUPER_SECRET")
    JWT_ALG: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 8)
    JWT_ISSUER: Optional[str] = None
    JWT_AUDIENCE: Optional[str] = None
    JWT_LEEWAY_SECONDS: int = Field(default=10)  # tolerancia de reloj

    # --- CORS ---
    # Acepta lista en .env como: CORS_ORIGINS=["http://localhost:5173","https://app.ejemplo.com"]
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["*"])

    @validator("ACCESS_TOKEN_EXPIRE_MINUTES")
    def _positive_exp(cls, v):
        if v <= 0:
            raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be positive")
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
