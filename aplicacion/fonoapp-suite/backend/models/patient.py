from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, func, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from ..core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(120), nullable=False, index=True)
    last_name  = Column(String(120), nullable=False, index=True)

    # NUEVO: cédula original tal como la ingresó el usuario (opcional)
    cedula      = Column(String(50), nullable=True)
    # NUEVO: versión normalizada, única (para comparar y buscar)
    cedula_norm = Column(String(64), nullable=True, unique=True, index=True)

    birth_date = Column(Date, nullable=True)
    diagnosis  = Column(Text, nullable=True, index=True)
    notes      = Column(Text, nullable=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)  # vincular a login paciente
    created_at = Column(DateTime, server_default=func.now(), index=True)
    deleted_at = Column(DateTime, nullable=True, index=True)

    user = relationship("User")

# Índices de ayuda para búsquedas por nombre (case-insensitive)
Index("ix_patients_first_name_lower", func.lower(Patient.first_name))
Index("ix_patients_last_name_lower",  func.lower(Patient.last_name))
