from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..core.deps import get_current_user, require_roles
from ..core.database import get_db
from ..schemas.patient import PatientCreate, PatientUpdate, PatientOut
from ..models.patient import Patient
import re

router = APIRouter(prefix="/patients", tags=["patients"])

def norm_cedula(v: str | None) -> str | None:
    if not v:
        return None
    # Deja solo dígitos y letras (sin tildes, sin guiones/espacios)
    v = re.sub(r"[^0-9A-Za-z]", "", v).upper()
    return v or None

@router.get("/", response_model=list[PatientOut])
def list_patients(
    db: Session = Depends(get_db),
    q: str | None = Query(None, description="Búsqueda por nombre o cédula"),
    user = Depends(get_current_user),
):
    query = db.query(Patient)
    if q:
        nq = norm_cedula(q)
        q_like = f"%{q.strip()}%"
        ors = [
            Patient.first_name.ilike(q_like),
            Patient.last_name.ilike(q_like),
        ]
        if nq:
            ors.append(Patient.cedula_norm == nq)
        query = query.filter(or_(*ors))
    return query.order_by(Patient.id.desc()).all()

@router.post("/", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    data: PatientCreate,
    db: Session = Depends(get_db),
    user = Depends(require_roles("admin", "therapist", "assistant")),
):
    cedula_norm = norm_cedula(data.cedula)
    # Evita duplicados por cédula normalizada
    if cedula_norm:
        exists = db.query(Patient).filter(Patient.cedula_norm == cedula_norm).first()
        if exists:
            raise HTTPException(status_code=409, detail="Cédula ya registrada")

    obj = Patient(
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        birth_date=data.birth_date,
        diagnosis=(data.diagnosis or None),
        notes=(data.notes or None),
        user_id=data.user_id,
        cedula=data.cedula,
        cedula_norm=cedula_norm,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    obj = db.query(Patient).get(patient_id)
    if not obj:
        raise HTTPException(404, "Paciente no encontrado")
    return obj

@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int,
    data: PatientUpdate,
    db: Session = Depends(get_db),
    user = Depends(require_roles("admin", "therapist", "assistant")),
):
    obj = db.query(Patient).get(patient_id)
    if not obj:
        raise HTTPException(404, "Paciente no encontrado")

    if data.cedula is not None:
        new_norm = norm_cedula(data.cedula)
        if new_norm and new_norm != obj.cedula_norm:
            dup = db.query(Patient).filter(Patient.cedula_norm == new_norm, Patient.id != patient_id).first()
            if dup:
                raise HTTPException(409, "Cédula ya registrada en otro paciente")
        obj.cedula = data.cedula
        obj.cedula_norm = new_norm

    for f in ("first_name","last_name","birth_date","diagnosis","notes","user_id"):
        val = getattr(data, f)
        if val is not None:
            setattr(obj, f, val.strip() if isinstance(val, str) else val)

    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{patient_id}", status_code=204)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user = Depends(require_roles("admin", "therapist")),
):
    obj = db.query(Patient).get(patient_id)
    if not obj:
        return  # 204
    db.delete(obj)
    db.commit()
