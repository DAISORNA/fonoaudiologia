# backend/routers/appointments.py
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..core.deps import require_roles
from ..models.appointment import Appointment
from ..schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentOut

router = APIRouter(prefix="/appointments", tags=["appointments"])

# 🔁 Evita duplicación de literales
APPT_NOT_FOUND = "Appointment not found"

def _overlaps(
    db: Session,
    starts_at: datetime,
    ends_at: datetime,
    therapist_id: int,
    exclude_id: Optional[int] = None,
) -> bool:
    q = db.query(Appointment).filter(
        Appointment.therapist_id == therapist_id,
        Appointment.starts_at < ends_at,
        Appointment.ends_at > starts_at,
    )
    if exclude_id:
        q = q.filter(Appointment.id != exclude_id)
    return db.query(q.exists()).scalar()

def _get_appt_or_404(db: Session, appt_id: int) -> Appointment:
    appt = db.get(Appointment, appt_id)
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=APPT_NOT_FOUND)
    return appt

@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    try:
        # Validación de solapamiento
        if _overlaps(db, data.starts_at, data.ends_at, data.therapist_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Overlapping appointment for therapist",
            )

        appt = Appointment(**data.dict())
        db.add(appt)
        db.commit()
        db.refresh(appt)
        return appt
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error creating appointment",
        )

@router.get("/", response_model=List[AppointmentOut])
def list_appointments(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    patient_id: Optional[int] = None,
    therapist_id: Optional[int] = None,
    starts_from: Optional[datetime] = None,
    ends_before: Optional[datetime] = None,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    q = db.query(Appointment)
    if patient_id is not None:
        q = q.filter(Appointment.patient_id == patient_id)
    if therapist_id is not None:
        q = q.filter(Appointment.therapist_id == therapist_id)
    if starts_from is not None:
        q = q.filter(Appointment.starts_at >= starts_from)
    if ends_before is not None:
        q = q.filter(Appointment.ends_at <= ends_before)

    return q.order_by(Appointment.starts_at.asc()).offset(offset).limit(limit).all()

@router.get("/{id}", response_model=AppointmentOut)
def get_appointment(
    id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    return _get_appt_or_404(db, id)

@router.put("/{id}", response_model=AppointmentOut)
def update_appointment(
    id: int,
    data: AppointmentUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    appt = _get_appt_or_404(db, id)

    try:
        incoming = data.dict(exclude_unset=True)

        # Revalida solapamiento si cambian fechas/terapeuta
        if {"starts_at", "ends_at", "therapist_id"} & set(incoming):
            starts = incoming.get("starts_at", appt.starts_at)
            ends = incoming.get("ends_at", appt.ends_at)
            therapist = incoming.get("therapist_id", appt.therapist_id)
            if _overlaps(db, starts, ends, therapist, exclude_id=appt.id):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Overlapping appointment for therapist",
                )

        for k, v in incoming.items():
            setattr(appt, k, v)

        db.commit()
        db.refresh(appt)
        return appt
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error updating appointment",
        )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist")),
):
    appt = _get_appt_or_404(db, id)
    try:
        db.delete(appt)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error deleting appointment",
        )
