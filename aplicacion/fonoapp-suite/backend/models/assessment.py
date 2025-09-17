# backend/models/assessment.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB  # usa JSONB en Postgres
from ..core.database import Base

class AssessmentTemplate(Base):
    __tablename__ = "assessment_templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    # Atributo Python schema_, columna en BD "schema" (no cambia el esquema)
    schema_ = Column("schema", JSONB, nullable=False, default=dict)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    results = relationship(
        "AssessmentResult",
        back_populates="template",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("assessment_templates.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    responses = Column(JSONB, nullable=False, default=dict)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    template = relationship("AssessmentTemplate", back_populates="results")
