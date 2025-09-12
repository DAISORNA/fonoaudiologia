from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.assignment import Assignment
from ..schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentOut
from ..core.deps import require_roles, get_current_user
from typing import List

router = APIRouter()

@router.post("/", response_model=AssignmentOut)
def create(data: AssignmentCreate, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    a = Assignment(**data.dict()); db.add(a); db.commit(); db.refresh(a); return a

@router.get("/patient/{patient_id}", response_model=List[AssignmentOut])
def list_for_patient(patient_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Assignment).filter(Assignment.patient_id==patient_id).order_by(Assignment.id.desc()).all()
