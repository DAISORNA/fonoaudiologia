# backend/routers/plans.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..core.deps import require_roles, get_current_user
from ..models.plan import TreatmentPlan, SessionLog
from ..schemas.plan import (
    TreatmentPlanCreate,
    TreatmentPlanUpdate,
    TreatmentPlanOut,
    SessionLogCreate,
    SessionLogUpdate,   # por si luego agregas update de logs
    SessionLogOut,
)

router = APIRouter(prefix="/plans", tags=["plans"])

# ----------------- Helpers -----------------

def _get_plan_or_404(db: Session, plan_id: int) -> TreatmentPlan:
    plan = db.get(TreatmentPlan, plan_id)  # SQLAlchemy 2.0
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return plan

# ----------------- Treatment Plans -----------------

@router.post("/", response_model=TreatmentPlanOut, status_code=status.HTTP_201_CREATED)
def create_plan(
    data: TreatmentPlanCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist")),
):
    try:
        plan = TreatmentPlan(**data.dict())
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error creating plan")


@router.get("/patient/{patient_id}", response_model=List[TreatmentPlanOut])
def list_plans(
    patient_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    order: str = Query("asc", pattern="^(asc|desc)$"),
):
    q = db.query(TreatmentPlan).filter(TreatmentPlan.patient_id == patient_id)
    q = q.order_by(TreatmentPlan.id.asc() if order == "asc" else TreatmentPlan.id.desc())
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=TreatmentPlanOut)
def get_plan(
    id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return _get_plan_or_404(db, id)


@router.put("/{id}", response_model=TreatmentPlanOut)
def update_plan(
    id: int,
    data: TreatmentPlanUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist")),
):
    plan = _get_plan_or_404(db, id)
    try:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(plan, k, v)
        db.commit()
        db.refresh(plan)
        return plan
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error updating plan")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist")),
):
    plan = _get_plan_or_404(db, id)
    try:
        db.delete(plan)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error deleting plan")

# ----------------- Session Logs -----------------

@router.post("/{plan_id}/logs", response_model=SessionLogOut, status_code=status.HTTP_201_CREATED)
def create_log(
    plan_id: int,
    data: SessionLogCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    _ = _get_plan_or_404(db, plan_id)  # asegura 404 si no existe
    try:
        log = SessionLog(plan_id=plan_id, **data.dict())
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error creating session log")


@router.get("/{plan_id}/logs", response_model=List[SessionLogOut])
def list_logs(
    plan_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=1000),
    order: str = Query("asc", pattern="^(asc|desc)$"),
):
    _ = _get_plan_or_404(db, plan_id)
    q = db.query(SessionLog).filter(SessionLog.plan_id == plan_id)
    q = q.order_by(SessionLog.id.asc() if order == "asc" else SessionLog.id.desc())
    return q.offset(skip).limit(limit).all()
