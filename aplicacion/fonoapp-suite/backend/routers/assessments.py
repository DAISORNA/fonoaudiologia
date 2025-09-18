# backend/routers/assessments.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..core.database import get_db
from ..core.deps import require_roles
from ..models.assessment import AssessmentTemplate, AssessmentResult
from ..schemas.assessment import (
    AssessmentTemplateCreate, AssessmentTemplateUpdate, AssessmentTemplateOut,
    AssessmentResultCreate,  AssessmentResultUpdate,  AssessmentResultOut,
)

# 👇 ESTO es lo que falta si te da el AttributeError
router = APIRouter(prefix="/assessments", tags=["assessments"])

# ---------------- Templates ----------------

@router.post("/templates", response_model=AssessmentTemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(
    data: AssessmentTemplateCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist")),
):
    # Usa el atributo Python schema_, no "schema"
    t = AssessmentTemplate(name=data.name, schema_=data.schema_)
    db.add(t); db.commit(); db.refresh(t)
    return t

@router.get("/templates", response_model=List[AssessmentTemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    return db.execute(
        select(AssessmentTemplate).order_by(AssessmentTemplate.id.desc())
    ).scalars().all()

@router.put("/templates/{template_id}", response_model=AssessmentTemplateOut)
def update_template(
    template_id: int,
    data: AssessmentTemplateUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist")),
):
    t = db.get(AssessmentTemplate, template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")

    if data.name is not None:
        t.name = data.name
    if data.schema_ is not None:
        t.schema_ = data.schema_

    db.commit(); db.refresh(t)
    return t

# ---------------- Results ----------------

@router.post("/results", response_model=AssessmentResultOut, status_code=status.HTTP_201_CREATED)
def create_result(
    data: AssessmentResultCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    r = AssessmentResult(**data.dict())
    db.add(r); db.commit(); db.refresh(r)
    return r

@router.get("/results/patient/{patient_id}", response_model=List[AssessmentResultOut])
def list_results_by_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    return db.execute(
        select(AssessmentResult)
        .where(AssessmentResult.patient_id == patient_id)
        .order_by(AssessmentResult.id.desc())
    ).scalars().all()
