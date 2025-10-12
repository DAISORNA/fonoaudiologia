# backend/routers/files.py
from __future__ import annotations

from typing import Optional, List
from uuid import uuid4
from pathlib import Path

import aiofiles
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..core.deps import require_roles
from ..models.file import MediaFile
from ..schemas.file import MediaFileOut

# --- Constantes y mensajes reutilizables (reduce duplicación) ---
STORAGE_DIR = Path("backend/storage")
ALLOWED_EXTS = {".png", ".jpg", ".jpeg", ".pdf", ".mp3", ".mp4", ".wav", ".webm", ".docx", ".xlsx", ".pptx", ".txt"}
MAX_BYTES = 50 * 1024 * 1024  # 50MB

ERR_EXT_NOT_ALLOWED = "File extension {ext} not allowed"
ERR_TOO_LARGE = "File too large (>50MB)"
ERR_DB_CREATE = "Database error while saving file"

STORAGE_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(prefix="/files", tags=["files"])


# ---------- Helpers pequeños (baja complejidad en el endpoint) ----------
def _safe_join(base: Path, name: str) -> Path:
    """
    Une `base` y `name` evitando path traversal. No acepta separadores ni '..' en `name`.
    """
    # Aceptamos solo nombres "planos" generados por servidor
    candidate = base.joinpath(name).resolve()
    if base.resolve() not in candidate.parents and candidate != base.resolve():
        # Defensive: evitar escapes fuera del directorio
        raise HTTPException(status_code=400, detail="Invalid file path")
    return candidate


def _ext_of(filename: Optional[str]) -> str:
    return Path(filename or "").suffix.lower()


def _validate_ext(ext: str) -> None:
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail=ERR_EXT_NOT_ALLOWED.format(ext=ext))


def _server_filename(ext: str) -> str:
    """Nombre generado por el servidor (no controlado por usuario)."""
    return f"{uuid4().hex}{ext}"


async def _save_stream_async(dst_path: Path, in_file: UploadFile) -> int:
    """
    Copia asíncronamente el stream del UploadFile a disco, limitando el tamaño.
    Devuelve los bytes escritos.
    """
    written = 0
    # Asíncrono: cumpliendo recomendación Sonar (“use an asynchronous file API”)
    async with aiofiles.open(dst_path, "wb") as out:
        while True:
            chunk = await in_file.read(1024 * 1024)  # 1MiB
            if not chunk:
                break
            written += len(chunk)
            if written > MAX_BYTES:
                raise HTTPException(status_code=413, detail=ERR_TOO_LARGE)
            await out.write(chunk)
    return written


# ------------------- Endpoints -------------------
@router.post("/upload", response_model=MediaFileOut, status_code=status.HTTP_201_CREATED)
async def upload(
    patient_id: Optional[int] = None,
    f: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin", "therapist", "assistant")),
):
    """
    Sube un archivo al almacenamiento local de manera segura:
    - valida extensión permitida,
    - genera nombre de archivo por el servidor,
    - guarda por streaming asíncrono con límite de tamaño,
    - registra el metadato en DB.
    """
    ext = _ext_of(f.filename)
    _validate_ext(ext)

    fname = _server_filename(ext)          # nombre no controlado por usuario
    full_path = _safe_join(STORAGE_DIR, fname)

    try:
        # Guardar stream en disco (async)
        await _save_stream_async(full_path, f)

        # Persistir metadatos
        record = MediaFile(
            patient_id=patient_id,
            path=f"/media/{fname}",
            # Si tu modelo tiene estos campos, puedes activarlos:
            # original_name=f.filename,
            # mime_type=f.content_type,
            # size_bytes=size_written,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    except HTTPException:
        # Limpieza en caso de fallo (tamaño/ext, etc.)
        if full_path.exists():
            try:
                full_path.unlink()
            except Exception:
                pass
        raise

    except SQLAlchemyError:
        if full_path.exists():
            try:
                full_path.unlink()
            except Exception:
                pass
        db.rollback()
        raise HTTPException(status_code=500, detail=ERR_DB_CREATE)
