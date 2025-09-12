from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.appointment import Appointment
from ..schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentOut
from ..core.deps import require_roles, get_current_user
from typing import List

router = APIRouter()

@router.post("/", response_model=AppointmentOut)
def create(data: AppointmentCreate, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    a = Appointment(**data.dict()); db.add(a); db.commit(); db.refresh(a); return a

@router.get("/", response_model=List[AppointmentOut])
def list_all(db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    return db.query(Appointment).order_by(Appointment.starts_at.asc()).all()

@router.put("/{id}", response_model=AppointmentOut)
def update(id: int, data: AppointmentUpdate, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    a = db.query(Appointment).get(id); if not a: raise HTTPException(404, "Not found")
    for k,v in data.dict(exclude_unset=True).items(): setattr(a,k,v)
    db.commit(); db.refresh(a); return a

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist"))):
    a = db.query(Appointment).get(id); if not a: raise HTTPException(404, "Not found")
    db.delete(a); db.commit(); return {"deleted": id}
