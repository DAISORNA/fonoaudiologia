# backend/routers/patients.py
from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from ..core.database import get_db
from ..core.deps import require_roles
from ..models.patient import Patient
from ..schemas.patient import PatientCreate, PatientUpdate, PatientOut

router = APIRouter(prefix="/patients", tags=["patients"])


# ----------------------------
# Helpers (normalizar cédula, unicidad, filtros, orden)
# ----------------------------

import re
_CED_NORM_RE = re.compile(r"[^0-9A-Za-z]+")

def normalize_cedula(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    norm = _CED_NORM_RE.sub("", value).upper()
    return norm or None

def _ensure_unique_cedula(db: Session, cedula_norm: Optional[str], exclude_id: Optional[int] = None):
    if not cedula_norm:
        return
    q = db.query(Patient).filter(Patient.cedula_norm == cedula_norm)
    if exclude_id:
        q = q.filter(Patient.id != exclude_id)
    if db.query(q.exists()).scalar():
        raise HTTPException(status_code=409, detail="La cédula ya está registrada")

# Lista blanca de ordenamiento
SORTABLE = {
    "id": Patient.id.asc(),
    "-id": Patient.id.desc(),
    "created_at": Patient.created_at.asc(),
    "-created_at": Patient.created_at.desc(),
    "first_name": Patient.first_name.asc(),
    "-first_name": Patient.first_name.desc(),
    "last_name": Patient.last_name.asc(),
    "-last_name": Patient.last_name.desc(),
    "birth_date": Patient.birth_date.asc(),
    "-birth_date": Patient.birth_date.desc(),
    "cedula": Patient.cedula.asc(),
    "-cedula": Patient.cedula.desc(),
}

def _apply_sort(sort: str, query):
    order = SORTABLE.get(sort, SORTABLE["-created_at"])
    return query.order_by(order)

def _apply_filters(
    q_text: Optional[str],
    diagnosis: Optional[str],
    birth_from: Optional[date],
    birth_to: Optional[date],
    created_from: Optional[date],
    created_to: Optional[date],
    include_deleted: bool,
    query,
    cedula: Optional[str] = None,
):
    conds = []

    if not include_deleted:
        conds.append(Patient.deleted_at.is_(None))

    if q_text:
        qt = q_text.strip()
        pattern = f"%{qt}%"
        conds.append(
            or_(
                Patient.first_name.ilike(pattern),
                Patient.last_name.ilike(pattern),
                Patient.diagnosis.ilike(pattern),
                Patient.cedula.ilike(pattern),
            )
        )

    if diagnosis:
        conds.append(Patient.diagnosis.ilike(f"%{diagnosis.strip()}%"))

    if cedula:
        c_norm = normalize_cedula(cedula)
        if c_norm:
            conds.append(
                or_(
                    Patient.cedula_norm == c_norm,
                    Patient.cedula.ilike(f"%{cedula.strip()}%"),
                )
            )

    if birth_from:
        conds.append(Patient.birth_date >= birth_from)
    if birth_to:
        conds.append(Patient.birth_date <= birth_to)

    if created_from:
        # incluye el día completo
        conds.append(Patient.created_at >= datetime.combine(created_from, datetime.min.time(), tzinfo=None))
    if created_to:
        conds.append(Patient.created_at <= datetime.combine(created_to, datetime.max.time(), tzinfo=None))

    if conds:
        query = query.filter(and_(*conds))
    return query


# ----------------------------
# Endpoints
# ----------------------------

@router.get("/", response_model=List[PatientOut])
def list_patients(
    q: str | None = Query(None, description="Buscar en nombre, apellido, diagnóstico o cédula"),
    diagnosis: str | None = Query(None),
    cedula: str | None = Query(None, description="Búsqueda por cédula; acepta parcial o exacta normalizada"),
    birth_from: date | None = Query(None),
    birth_to: date | None = Query(None),
    created_from: date | None = Query(None),
    created_to: date | None = Query(None),
    sort: str = Query("-created_at", description=f"Uno de: {', '.join(SORTABLE.keys())}"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    include_deleted: bool = Query(False, description="Solo admin puede ver registros eliminados"),
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    if include_deleted and user.role != "admin":
        include_deleted = False

    qset = db.query(Patient)
    qset = _apply_filters(q, diagnosis, birth_from, birth_to, created_from, created_to, include_deleted, qset, cedula=cedula)
    qset = _apply_sort(sort, qset)
    return qset.offset(offset).limit(limit).all()


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: int,
    include_deleted: bool = Query(False),
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p or (p.deleted_at is not None and not (include_deleted and user.role == "admin")):
        raise HTTPException(status_code=404, detail="Not found")
    return p


@router.get("/by-cedula/{doc}", response_model=PatientOut)
def get_by_cedula(
    doc: str,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    c_norm = normalize_cedula(doc)
    if not c_norm:
        raise HTTPException(status_code=400, detail="Cédula inválida")
    p = (
        db.query(Patient)
        .filter(Patient.cedula_norm == c_norm, Patient.deleted_at.is_(None))
        .first()
    )
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return p


@router.post("/", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    data: PatientCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    ced_norm = normalize_cedula(data.cedula)
    _ensure_unique_cedula(db, ced_norm)

    p = Patient(**data.dict())
    p.cedula_norm = ced_norm

    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int,
    data: PatientUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    p = db.query(Patient).filter(Patient.id == patient_id, Patient.deleted_at.is_(None)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")

    payload = data.dict(exclude_unset=True)

    if "cedula" in payload:
        ced_norm = normalize_cedula(payload.get("cedula"))
        _ensure_unique_cedula(db, ced_norm, exclude_id=patient_id)
        p.cedula = payload.get("cedula")
        p.cedula_norm = ced_norm
        payload.pop("cedula", None)

    for k, v in payload.items():
        setattr(p, k, v)

    db.commit()
    db.refresh(p)
    return p


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def soft_delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    p = db.query(Patient).filter(Patient.id == patient_id, Patient.deleted_at.is_(None)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    p.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{patient_id}/restore", response_model=PatientOut)
def restore_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist")),
):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p or p.deleted_at is None:
        raise HTTPException(status_code=404, detail="Not found o no está eliminado")
    p.deleted_at = None
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{patient_id}/hard", status_code=status.HTTP_204_NO_CONTENT)
def hard_delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin")),
):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(p)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
