from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..models.assessment import AssessmentTemplate, AssessmentResult
from ..schemas.assessment import (
    AssessmentTemplateCreate, AssessmentTemplateUpdate, AssessmentTemplateOut,
    AssessmentResultCreate, AssessmentResultUpdate, AssessmentResultOut
)
from ..core.deps import require_roles

router = APIRouter(prefix="/assessments", tags=["assessments"])

@router.post("/templates", response_model=AssessmentTemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(
    data: AssessmentTemplateCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin","therapist"))
):
    try:
        t = AssessmentTemplate(**data.dict())
        db.add(t); db.commit(); db.refresh(t)
        return t
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Database error creating template")

@router.get("/templates", response_model=List[AssessmentTemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin","therapist","assistant")),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return db.query(AssessmentTemplate).order_by(AssessmentTemplate.id.desc()).offset(skip).limit(limit).all()

@router.get("/templates/{id}", response_model=AssessmentTemplateOut)
def get_template(id: int, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    t = db.get(AssessmentTemplate, id)
    if not t:
        raise HTTPException(404, "Template not found")
    return t

@router.post("/results", response_model=AssessmentResultOut, status_code=status.HTTP_201_CREATED)
def create_result(
    data: AssessmentResultCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin","therapist","assistant"))
):
    try:
        r = AssessmentResult(**data.dict())
        db.add(r); db.commit(); db.refresh(r)
        return r
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Database error creating result")

@router.get("/results/patient/{patient_id}", response_model=List[AssessmentResultOut])
def list_results(
    patient_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin","therapist","assistant")),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    q = db.query(AssessmentResult).filter(AssessmentResult.patient_id==patient_id)
    return q.order_by(AssessmentResult.id.desc()).offset(skip).limit(limit).all()

@router.get("/results/{id}", response_model=AssessmentResultOut)
def get_result(id: int, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    r = db.get(AssessmentResult, id)
    if not r:
        raise HTTPException(404, "Result not found")
    return r
