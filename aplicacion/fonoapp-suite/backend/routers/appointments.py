# backend/routers/appointments.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.deps import require_roles
from ..models.appointment import Appointment
from ..schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentOut

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    appt = Appointment(**data.dict())
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt

@router.get("/", response_model=List[AppointmentOut])
def list_appointments(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    return (
        db.query(Appointment)
        .order_by(Appointment.starts_at.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.get("/{id}", response_model=AppointmentOut)
def get_appointment(
    id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    appt = db.get(Appointment, id)  # SQLAlchemy 2.0
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt

@router.put("/{id}", response_model=AppointmentOut)
def update_appointment(
    id: int,
    data: AppointmentUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    appt = db.get(Appointment, id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(appt, k, v)

    db.commit()
    db.refresh(appt)
    return appt

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist")),
):
    appt = db.get(Appointment, id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.delete(appt)
    db.commit()

