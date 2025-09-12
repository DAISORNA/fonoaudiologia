from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.assessment import AssessmentTemplate, AssessmentResult
from ..schemas.assessment import AssessmentTemplateCreate, AssessmentTemplateUpdate, AssessmentTemplateOut, AssessmentResultCreate, AssessmentResultUpdate, AssessmentResultOut
from ..core.deps import require_roles
from typing import List

router = APIRouter()

@router.post("/templates", response_model=AssessmentTemplateOut)
def create_template(data: AssessmentTemplateCreate, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist"))):
    t = AssessmentTemplate(**data.dict()); db.add(t); db.commit(); db.refresh(t); return t

@router.get("/templates", response_model=List[AssessmentTemplateOut])
def list_templates(db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    return db.query(AssessmentTemplate).all()

@router.post("/results", response_model=AssessmentResultOut)
def create_result(data: AssessmentResultCreate, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    r = AssessmentResult(**data.dict()); db.add(r); db.commit(); db.refresh(r); return r

@router.get("/results/patient/{patient_id}", response_model=List[AssessmentResultOut])
def list_results(patient_id: int, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    return db.query(AssessmentResult).filter(AssessmentResult.patient_id==patient_id).all()
