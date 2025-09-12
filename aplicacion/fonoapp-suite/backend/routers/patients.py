from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.patient import Patient
from ..schemas.patient import PatientCreate, PatientUpdate, PatientOut
from ..core.deps import get_current_user, require_roles
from typing import List

router = APIRouter()

@router.post("/", response_model=PatientOut)
def create(data: PatientCreate, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    patient = Patient(**data.dict())
    db.add(patient); db.commit(); db.refresh(patient)
    return patient

@router.get("/", response_model=List[PatientOut])
def list_all(db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    return db.query(Patient).order_by(Patient.id.desc()).all()

@router.get("/{patient_id}", response_model=PatientOut)
def get_one(patient_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = db.query(Patient).get(patient_id)
    if not p: raise HTTPException(status_code=404, detail="Not found")
    return p

@router.put("/{patient_id}", response_model=PatientOut)
def update(patient_id: int, data: PatientUpdate, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist"))):
    p = db.query(Patient).get(patient_id)
    if not p: raise HTTPException(status_code=404, detail="Not found")
    for k,v in data.dict(exclude_unset=True).items(): setattr(p,k,v)
    db.commit(); db.refresh(p); return p

@router.delete("/{patient_id}")
def delete(patient_id: int, db: Session = Depends(get_db), user=Depends(require_roles("admin"))):
    p = db.query(Patient).get(patient_id)
    if not p: raise HTTPException(status_code=404, detail="Not found")
    db.delete(p); db.commit(); return {"deleted": patient_id}
