from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from ..core.database import Base

class MediaFile(Base):
    __tablename__ = "media_files"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    path = Column(String(512), nullable=False)  # relative to storage
    kind = Column(String(32), default="file")
    created_at = Column(DateTime, server_default=func.now())
