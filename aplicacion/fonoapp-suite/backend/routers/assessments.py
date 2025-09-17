# backend/schemas/assessment.py
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

# ---------- TEMPLATES ----------

class AssessmentTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    # RENOMBRADO: usa schema_ en Python, pero "schema" en JSON
    schema_: Dict[str, Any] = Field(..., alias="schema")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True  # permite usar schema_ al crear desde Python


class AssessmentTemplateCreate(AssessmentTemplateBase):
    pass


class AssessmentTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    schema_: Optional[Dict[str, Any]] = Field(None, alias="schema")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class AssessmentTemplateOut(AssessmentTemplateBase):
    id: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

# ---------- RESULTS (ajusta si también usabas 'schema' aquí) ----------

class AssessmentResultBase(BaseModel):
    patient_id: int
    template_id: int
    # si aquí también usabas "schema", aplica el mismo patrón
    data: Dict[str, Any]  # o schema_: Dict[str, Any] = Field(..., alias="schema")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class AssessmentResultCreate(AssessmentResultBase):
    pass


class AssessmentResultUpdate(BaseModel):
    patient_id: Optional[int] = None
    template_id: Optional[int] = None
    data: Optional[Dict[str, Any]] = None  # o schema_ con alias si lo necesitas

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class AssessmentResultOut(AssessmentResultBase):
    id: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
