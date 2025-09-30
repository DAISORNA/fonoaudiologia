from datetime import date
from typing import Optional
from pydantic import BaseModel, constr, validator


# tipo acotado para cédula (ajusta longitudes si lo necesitas)
Cedula = constr(strip_whitespace=True, min_length=3, max_length=64)


class PatientBase(BaseModel):
    first_name: str
    last_name: str
    birth_date: Optional[date] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    user_id: Optional[int] = None

    # valor ingresado por el usuario
    cedula: Optional[Cedula] = None

    @validator("first_name", "last_name", "diagnosis", "notes", "cedula", pre=True)
    def _strip_strings(cls, v):
        return v.strip() if isinstance(v, str) else v


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    # todos los campos opcionales para parches completos (PUT) simples
    pass


class PatientOut(PatientBase):
    id: int
    # además devolvemos la versión normalizada si existe
    cedula_norm: Optional[str] = None

    class Config:
        orm_mode = True
