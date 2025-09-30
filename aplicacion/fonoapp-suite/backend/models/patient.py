from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Text, ForeignKey, func, Index, text
)
from sqlalchemy.orm import relationship
from ..core.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    # Datos básicos
    first_name = Column(String(120), nullable=False)
    last_name = Column(String(120), nullable=False)
    birth_date = Column(Date, nullable=True)

    diagnosis = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    # Identificación (coincide con tu tabla actual)
    cedula = Column(String(64), nullable=True, index=True)
    cedula_norm = Column(String(64), nullable=True, index=True)

    # Relación (opcional) con usuario que tiene login
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User")

    # Trazabilidad
    created_at = Column(DateTime, server_default=func.now())
    deleted_at = Column(DateTime, nullable=True)

    # Índice único parcial para evitar duplicados de cédula normalizada
    __table_args__ = (
        Index(
            "ux_patients_cedula_norm",
            "cedula_norm",
            unique=True,
            postgresql_where=text("cedula_norm IS NOT NULL"),
        ),
    )

    def __repr__(self) -> str:  # útil al depurar
        return (
            f"<Patient id={self.id} name='{self.first_name} {self.last_name}' "
            f"cedula='{self.cedula}' cedula_norm='{self.cedula_norm}'>"
        )
