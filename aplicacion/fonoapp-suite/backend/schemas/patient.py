from pydantic import BaseModel
from datetime import date

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    birth_date: date | None = None
    diagnosis: str | None = None
    notes: str | None = None
    user_id: int | None = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    pass

class PatientOut(PatientBase):
    id: int
    class Config:
        orm_mode = True
