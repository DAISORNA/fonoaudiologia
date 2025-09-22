from pydantic import BaseModel, validator
from datetime import date, datetime
import re

_CEDULA_ALLOWED = re.compile(r"^[A-Za-z0-9.\- ]{5,50}$")  # whitelisting
def _normalize_cedula(value: str | None) -> str | None:
    if value is None:
        return None
    # quita todo lo que no sea alfanumérico, a mayúsculas
    only = re.sub(r"[^0-9A-Za-z]+", "", value).upper()
    return only or None

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    birth_date: date | None = None
    diagnosis: str | None = None
    notes: str | None = None
    user_id: int | None = None

    # NUEVO: cedula (opcional pero validada)
    cedula: str | None = None

    @validator("first_name", "last_name")
    def _names_len(cls, v: str):
        v = (v or "").strip()
        if not (1 <= len(v) <= 120):
            raise ValueError("Longitud inválida")
        return v

    @validator("cedula")
    def _cedula_ok(cls, v: str | None):
        if v is None or v == "":
            return None
        vv = v.strip()
        if not _CEDULA_ALLOWED.match(vv):
            raise ValueError("Cédula inválida (use solo letras/números/puntos/guiones/espacios)")
        if _normalize_cedula(vv) is None:
            raise ValueError("Cédula inválida")
        return vv

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    pass

class PatientOut(PatientBase):
    id: int
    created_at: datetime | None = None
    deleted_at: datetime | None = None

    class Config:
        orm_mode = True
