from sqlalchemy import Column, Integer, String, DateTime, func
from ..core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(32), default="therapist")  # admin|therapist|assistant|patient
    created_at = Column(DateTime, server_default=func.now())
