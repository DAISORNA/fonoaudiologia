# backend/routers/auth.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..core.database import get_db
from ..core.security import verify_password, create_access_token, hash_password
from ..core.deps import get_current_user, require_roles
from ..schemas.auth import UserCreate, UserOut
from ..models import User  # asegúrate de exportar User en backend/models/__init__.py

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        role=user_in.role,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")
    db.refresh(user)
    return user

@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    """
    Acepta:
      - x-www-form-urlencoded: username, password
      - JSON: { "email": ..., "password": ... } o { "username": ..., "password": ... }
    """
    ct = request.headers.get("content-type", "")
    username = password = None

    if "application/x-www-form-urlencoded" in ct or "multipart/form-data" in ct:
        form = await request.form()
        username = (form.get("username") or "").strip()
        password = form.get("password")
    else:
        try:
            body = await request.json()
        except Exception:
            body = {}
        username = (body.get("email") or body.get("username") or "").strip()
        password = body.get("password")

    if not username or not password:
        raise HTTPException(status_code=422, detail="username/email and password are required")

    user = db.query(User).filter(User.email == username).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=user.email, role=user.role)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return user

@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), user=Depends(require_roles("admin"))):
    return db.query(User).order_by(User.id.asc()).all()
