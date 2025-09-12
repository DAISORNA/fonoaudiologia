from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from ..core.database import Base

class AssessmentTemplate(Base):
    __tablename__ = "assessment_templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    schema = Column(JSON, default=dict)  # JSON schema-like form
    created_at = Column(DateTime, server_default=func.now())

class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("assessment_templates.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    responses = Column(JSON, default=dict)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    template = relationship("AssessmentTemplate")
