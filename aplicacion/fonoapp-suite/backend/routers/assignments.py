from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..models.assignment import Assignment
from ..schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentOut
from ..core.deps import require_roles, get_current_user

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.post("/", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
def create(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin","therapist","assistant"))
):
    try:
        a = Assignment(**data.dict())
        db.add(a); db.commit(); db.refresh(a)
        return a
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Database error creating assignment")

@router.get("/patient/{patient_id}", response_model=List[AssignmentOut])
def list_for_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return (
        db.query(Assignment)
        .filter(Assignment.patient_id==patient_id)
        .order_by(Assignment.id.desc())
        .offset(skip).limit(limit).all()
    )
