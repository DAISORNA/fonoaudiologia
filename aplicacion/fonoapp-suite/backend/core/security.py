from datetime import datetime, timedelta, timezone
from uuid import uuid4
from jose import jwt, JWTError, ExpiredSignatureError
from passlib.context import CryptContext
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(
    subject: str,
    role: str,
    expires_minutes: int | None = None,
    *,
    audience: str | None = None,
    issuer: str | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    exp_delta = timedelta(minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": subject,
        "role": role,
        "type": "access",
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int((now + exp_delta).timestamp()),
        "jti": str(uuid4()),
    }
    if issuer or settings.JWT_ISSUER:
        to_encode["iss"] = issuer or settings.JWT_ISSUER
    if audience or settings.JWT_AUDIENCE:
        to_encode["aud"] = audience or settings.JWT_AUDIENCE

    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def decode_token(token: str) -> dict | None:
    try:
        # Leeway para pequeños desajustes de reloj
        options = {"verify_aud": bool(settings.JWT_AUDIENCE)}
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALG],
            audience=settings.JWT_AUDIENCE if settings.JWT_AUDIENCE else None,
            issuer=settings.JWT_ISSUER if settings.JWT_ISSUER else None,
            options=options,
            leeway=settings.JWT_LEEWAY_SECONDS,
        )
    except ExpiredSignatureError:
        # Token vencido; el caller (deps) devolverá 401
        return None
    except JWTError:
        # Firma inválida / claims malformadas
        return None
