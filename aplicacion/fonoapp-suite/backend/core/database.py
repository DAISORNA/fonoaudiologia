from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,                  # detecta conexiones rotas
    pool_size=settings.DB_POOL_SIZE,     # tamaño del pool
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_recycle=settings.DB_POOL_RECYCLE,  # recicla conexiones viejas (seg)
    pool_timeout=settings.DB_POOL_TIMEOUT,  # espera por conexión (seg)
    echo=settings.SQLALCHEMY_ECHO,       # útil en dev
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,  # evita que los objetos “se invaliden” tras commit
    future=True,
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
