from pydantic import BaseModel
from datetime import datetime

class AssignmentBase(BaseModel):
    patient_id: int
    title: str
    description: str | None = None
    due_at: datetime | None = None
    status: str = "pending"
    completed_at: datetime | None = None

class AssignmentCreate(AssignmentBase): pass
class AssignmentUpdate(AssignmentBase): pass

class AssignmentOut(AssignmentBase):
    id: int
    class Config: orm_mode = True
