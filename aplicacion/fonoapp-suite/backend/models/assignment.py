from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, func
from ..core.database import Base

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_at = Column(DateTime, nullable=True)
    status = Column(String(32), default="pending")  # pending|done
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
