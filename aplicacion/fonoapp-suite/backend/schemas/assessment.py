from pydantic import BaseModel
from typing import Any, Dict

class AssessmentTemplateBase(BaseModel):
    name: str
    schema: Dict[str, Any] = {}

class AssessmentTemplateCreate(AssessmentTemplateBase): pass
class AssessmentTemplateUpdate(AssessmentTemplateBase): pass

class AssessmentTemplateOut(AssessmentTemplateBase):
    id: int
    class Config: orm_mode = True

class AssessmentResultBase(BaseModel):
    template_id: int
    patient_id: int
    responses: Dict[str, Any] = {}
    score: int | None = None

class AssessmentResultCreate(AssessmentResultBase): pass
class AssessmentResultUpdate(AssessmentResultBase): pass

class AssessmentResultOut(AssessmentResultBase):
    id: int
    class Config: orm_mode = True
