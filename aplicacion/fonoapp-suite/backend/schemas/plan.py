from pydantic import BaseModel
from typing import Any, List, Dict

class TreatmentPlanBase(BaseModel):
    patient_id: int
    title: str
    goals: List[Dict[str, Any]] = []  # [{title, target, metric}]

class TreatmentPlanCreate(TreatmentPlanBase): pass
class TreatmentPlanUpdate(TreatmentPlanBase): pass

class TreatmentPlanOut(TreatmentPlanBase):
    id: int
    class Config: orm_mode = True

class SessionLogBase(BaseModel):
    plan_id: int
    progress: Dict[str, float] = {}
    notes: str | None = None

class SessionLogCreate(SessionLogBase): pass
class SessionLogUpdate(SessionLogBase): pass

class SessionLogOut(SessionLogBase):
    id: int
    class Config: orm_mode = True
