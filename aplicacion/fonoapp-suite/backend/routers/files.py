from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import os, uuid, shutil

from ..core.database import get_db
from ..models.file import MediaFile
from ..schemas.file import MediaFileOut
from ..core.deps import require_roles

from typing import List

STORAGE_DIR = "backend/storage"
os.makedirs(STORAGE_DIR, exist_ok=True)

ALLOWED_EXTS = {".png",".jpg",".jpeg",".pdf",".mp3",".mp4",".wav",".webm",".docx",".xlsx",".pptx",".txt"}
MAX_BYTES = 50 * 1024 * 1024  # 50MB

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/upload", response_model=MediaFileOut, status_code=status.HTTP_201_CREATED)
async def upload(
    patient_id: int | None = None,
    f: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(require_roles("admin","therapist","assistant")),
):
    ext = os.path.splitext(f.filename or "")[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(400, detail=f"File extension {ext} not allowed")

    fname = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(STORAGE_DIR, fname)

    size = 0
    try:
        with open(full_path, "wb") as out:
            while True:
                chunk = await f.read(1024 * 1024)  # 1MB
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_BYTES:
                    raise HTTPException(413, detail="File too large (>50MB)")
                out.write(chunk)

        m = MediaFile(
            patient_id=patient_id,
            path=f"/media/{fname}",
            # descomenta si tu modelo tiene estos campos:
            # original_name=f.filename,
            # mime_type=f.content_type,
            # size_bytes=size,
        )
        db.add(m)
        db.commit()
        db.refresh(m)
        return m
    except HTTPException:
        # borra archivo parcial si falló por tamaño, etc.
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
            except Exception:
                pass
        raise
    except SQLAlchemyError:
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
            except Exception:
                pass
        db.rollback()
        raise HTTPException(500, "Database error while saving file")
