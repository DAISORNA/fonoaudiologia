from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..models.patient import Patient
from ..schemas.patient import PatientCreate, PatientUpdate, PatientOut
from ..core.deps import get_current_user, require_roles

router = APIRouter(prefix="/patients", tags=["patients"])

@router.post("/", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create(
    data: PatientCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin","therapist","assistant"))
):
    try:
        patient = Patient(**data.dict())
        db.add(patient); db.commit(); db.refresh(patient)
        return patient
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Database error creating patient")

@router.get("/", response_model=List[PatientOut])
def list_all(
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin","therapist","assistant")),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return db.query(Patient).order_by(Patient.id.desc()).offset(skip).limit(limit).all()

@router.get("/{patient_id}", response_model=PatientOut)
def get_one(patient_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.get(Patient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return p

@router.put("/{patient_id}", response_model=PatientOut)
def update(
    patient_id: int,
    data: PatientUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin","therapist"))
):
    p = db.get(Patient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(p, k, v)
        db.commit(); db.refresh(p)
        return p
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Database error updating patient")

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    patient_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin"))
):
    p = db.get(Patient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        db.delete(p); db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(500, "Database error deleting patient")
