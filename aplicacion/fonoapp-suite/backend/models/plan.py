from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, func
from sqlalchemy.orm import relationship
from ..core.database import Base

class TreatmentPlan(Base):
    __tablename__ = "treatment_plans"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    title = Column(String(255), nullable=False)
    goals = Column(JSON, default=list)  # [{title, target, metric}]
    status = Column(String(32), default="active")
    created_at = Column(DateTime, server_default=func.now())

    patient = relationship("Patient")

class SessionLog(Base):
    __tablename__ = "session_logs"
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("treatment_plans.id"), nullable=False)
    date = Column(DateTime, server_default=func.now())
    progress = Column(JSON, default=dict)  # {goal_index: value}
    notes = Column(Text, nullable=True)

    plan = relationship("TreatmentPlan")
