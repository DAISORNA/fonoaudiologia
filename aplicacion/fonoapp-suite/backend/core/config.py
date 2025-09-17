from typing import List, Optional
from pydantic import BaseSettings, Field, validator, EmailStr, SecretStr

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
    JWT_ALG: str = Field(default="HS256")  # HS256 | HS384 | HS512 (según uses)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 8)
    JWT_ISSUER: Optional[str] = None
    JWT_AUDIENCE: Optional[str] = None
    JWT_LEEWAY_SECONDS: int = Field(default=10)  # tolerancia de reloj

    # --- CORS ---
    # Acepta lista en .env tipo JSON: ["http://localhost:5173","https://app.tu-dominio.com"]
    # o una lista separada por comas: http://localhost:5173,https://app.tu-dominio.com
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["*"])

    # --- Bootstrap Admin ---
    ADMIN_EMAIL: EmailStr = Field(default="admin@miapp.local")
    ADMIN_PASSWORD: SecretStr = Field(default=SecretStr("Admin#12345"))
    ADMIN_NAME: str = Field(default="Administrador")
    BOOTSTRAP_TOKEN: Optional[SecretStr] = None  # para endpoint /auth/bootstrap-admin (opcional)

    @validator("ACCESS_TOKEN_EXPIRE_MINUTES")
    def _positive_exp(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be positive")
        return v

    @validator("JWT_ALG")
    def _allowed_jwt_alg(cls, v: str) -> str:
        allowed = {"HS256", "HS384", "HS512"}
        if v not in allowed:
            raise ValueError(f"JWT_ALG must be one of {allowed}")
        return v

    @validator("CORS_ORIGINS", pre=True)
    def _parse_cors_origins(cls, v):
        # Permite JSON o lista separada por comas
        if isinstance(v, str):
            s = v.strip()
            if s.startswith("[") and s.endswith("]"):
                # es JSON válido -> Pydantic lo parsea solo
                return v
            # formato "a,b,c" -> list
            return [x.strip() for x in s.split(",") if x.strip()]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
