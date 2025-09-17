# backend/schemas/assessment.py
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

# ---------- Templates ----------

class AssessmentTemplateBase(BaseModel):
    name: str
    # En Python: schema_ ; En JSON: "schema"
    schema_: Dict[str, Any] = Field(default_factory=dict, alias="schema")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True  # permite usar schema_ al crear desde Python


class AssessmentTemplateCreate(AssessmentTemplateBase):
    pass


class AssessmentTemplateUpdate(BaseModel):
    name: Optional[str] = None
    schema_: Optional[Dict[str, Any]] = Field(default=None, alias="schema")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class AssessmentTemplateOut(AssessmentTemplateBase):
    id: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


# ---------- Results ----------

class AssessmentResultBase(BaseModel):
    template_id: int
    patient_id: int
    responses: Dict[str, Any] = Field(default_factory=dict)
    score: Optional[int] = None

    class Config:
        orm_mode = True


class AssessmentResultCreate(AssessmentResultBase):
    pass


class AssessmentResultUpdate(BaseModel):
    template_id: Optional[int] = None
    patient_id: Optional[int] = None
    responses: Optional[Dict[str, Any]] = None
    score: Optional[int] = None

    class Config:
        orm_mode = True


class AssessmentResultOut(AssessmentResultBase):
    id: int

    class Config:
        orm_mode = True
