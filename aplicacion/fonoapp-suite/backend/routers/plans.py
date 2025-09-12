from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.plan import TreatmentPlan, SessionLog
from ..schemas.plan import TreatmentPlanCreate, TreatmentPlanUpdate, TreatmentPlanOut, SessionLogCreate, SessionLogUpdate, SessionLogOut
from ..core.deps import require_roles, get_current_user
from typing import List

router = APIRouter()

@router.post("/", response_model=TreatmentPlanOut)
def create_plan(data: TreatmentPlanCreate, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist"))):
    p = TreatmentPlan(**data.dict()); db.add(p); db.commit(); db.refresh(p); return p

@router.get("/patient/{patient_id}", response_model=List[TreatmentPlanOut])
def list_plans(patient_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(TreatmentPlan).filter(TreatmentPlan.patient_id==patient_id).all()

@router.put("/{id}", response_model=TreatmentPlanOut)
def update_plan(id: int, data: TreatmentPlanUpdate, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist"))):
    p = db.query(TreatmentPlan).get(id); if not p: raise HTTPException(404,"Not found")
    for k,v in data.dict(exclude_unset=True).items(): setattr(p,k,v)
    db.commit(); db.refresh(p); return p

@router.post("/{plan_id}/logs", response_model=SessionLogOut)
def create_log(plan_id: int, data: SessionLogCreate, db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    l = SessionLog(plan_id=plan_id, progress=data.progress, notes=data.notes); db.add(l); db.commit(); db.refresh(l); return l

@router.get("/{plan_id}/logs", response_model=List[SessionLogOut])
def list_logs(plan_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(SessionLog).filter(SessionLog.plan_id==plan_id).order_by(SessionLog.id.asc()).all()
