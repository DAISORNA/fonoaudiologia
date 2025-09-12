from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import os, uuid
from ..core.database import get_db
from ..models.file import MediaFile
from ..schemas.file import MediaFileOut
from ..core.deps import require_roles
from typing import List

STORAGE_DIR = "backend/storage"
os.makedirs(STORAGE_DIR, exist_ok=True)

router = APIRouter()

@router.post("/upload", response_model=MediaFileOut)
async def upload(patient_id: int | None = None, f: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(require_roles("admin","therapist","assistant"))):
    ext = os.path.splitext(f.filename)[1]
    fname = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(STORAGE_DIR, fname)
    with open(full_path, "wb") as out:
        out.write(await f.read())
    m = MediaFile(patient_id=patient_id, path=f"/media/{fname}")
    db.add(m); db.commit(); db.refresh(m)
    return m
