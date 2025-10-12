# backend/routers/files.py
from __future__ import annotations

from typing import List, Optional
import os
import uuid
import shutil
import mimetypes

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..core.deps import require_roles
from ..models.file import MediaFile
from ..schemas.file import MediaFileOut

router = APIRouter(prefix="/files", tags=["files"])

# Carpeta de almacenamiento (constante, no controlada por el usuario)
STORAGE_DIR = os.path.abspath("backend/storage")
os.makedirs(STORAGE_DIR, exist_ok=True)

# Reglas
ALLOWED_EXTS = {
    ".png", ".jpg", ".jpeg", ".pdf", ".mp3", ".mp4", ".wav", ".webm", ".docx", ".xlsx", ".pptx", ".txt"
}
MAX_BYTES = 50 * 1024 * 1024  # 50 MB

def _safe_join(base: str, name: str) -> str:
    """
    Une 'name' a 'base' y comprueba que el resultado final queda dentro de 'base'.
    Evita path traversal (../../etc).
    """
    # No aceptamos separadores ni rutas
    if "/" in name or "\\" in name:
        raise HTTPException(status_code=400, detail="Invalid file name")
    candidate = os.path.abspath(os.path.join(base, name))
    # El path resultante DEBE quedar dentro del base
    if not candidate.startswith(base + os.sep):
        raise HTTPException(status_code=400, detail="Invalid storage path")
    return candidate

def _ext_of(upload: UploadFile) -> str:
    # Solo usamos la extensión; ignoramos el nombre original
    original = (upload.filename or "").lower().strip()
    _, ext = os.path.splitext(original)
    # Normaliza ext tipo .jpeg → .jpg si quieres (opcional)
    return ext

def _guess_mime(path: str) -> str:
    mt, _ = mimetypes.guess_type(path)
    return mt or "application/octet-stream"

@router.post("/upload", response_model=MediaFileOut, status_code=status.HTTP_201_CREATED)
async def upload(
    patient_id: Optional[int] = None,
    f: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    # 1) Validación de extensión
    ext = _ext_of(f)
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail=f"File extension {ext or 'unknown'} not allowed")

    # 2) Nombre generado por el servidor (no controlado por el usuario)
    fname = f"{uuid.uuid4().hex}{ext}"

    # 3) Construcción de ruta segura (anti traversal)
    full_path = _safe_join(STORAGE_DIR, fname)

    # 4) Escritura por streaming + límite de tamaño
    written = 0
    try:
        # write safely
        with open(full_path, "wb") as out:
            while True:
                chunk = await f.read(1024 * 1024)  # 1 MiB
                if not chunk:
                    break
                written += len(chunk)
                if written > MAX_BYTES:
                    raise HTTPException(status_code=413, detail="File too large (>50MB)")
                out.write(chunk)

        # 5) Guardar metadatos en BD (ruta pública controlada por backend)
        m = MediaFile(
            patient_id=patient_id,
            path=f"/media/{fname}",  # ¡OJO! La ruta pública la controlamos nosotros
            # si tu modelo tiene estos campos, puedes descomentar:
            # original_name=(f.filename or "")[:255],
            # mime_type=_guess_mime(full_path),
            # size_bytes=written,
        )
        db.add(m)
        db.commit()
        db.refresh(m)
        return m

    except HTTPException:
        # limpia archivo parcial
        try:
            if os.path.exists(full_path):
                os.remove(full_path)
        except Exception:
            pass
        raise

    except SQLAlchemyError:
        # limpia archivo si la BD falla
        try:
            if os.path.exists(full_path):
                os.remove(full_path)
        except Exception:
            pass
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while saving file")
