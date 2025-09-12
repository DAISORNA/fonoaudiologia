from pydantic import BaseSettings, Field
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql+psycopg2://fono:password@db:5432/fonoapp")
    JWT_SECRET: str = Field(default="CHANGE_ME_SUPER_SECRET")
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()
