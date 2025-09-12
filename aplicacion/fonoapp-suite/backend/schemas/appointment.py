from pydantic import BaseModel
from datetime import datetime

class AppointmentBase(BaseModel):
    patient_id: int
    starts_at: datetime
    ends_at: datetime
    status: str = "scheduled"
    notes: str | None = None

class AppointmentCreate(AppointmentBase): pass
class AppointmentUpdate(AppointmentBase): pass

class AppointmentOut(AppointmentBase):
    id: int
    class Config: orm_mode = True
