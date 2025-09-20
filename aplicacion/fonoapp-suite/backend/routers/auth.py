# backend/routers/auth.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..core.database import get_db
from ..core.security import verify_password, create_access_token, hash_password
from ..core.deps import get_current_user, require_roles
from ..schemas.auth import UserCreate, UserOut
from ..models import User  # asegúrate: backend/models/__init__.py tiene `from .user import User`

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@router.post("/register/", include_in_schema=False)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
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

# ⬇⬇ LOGIN (form-url-encoded: username=email, password=...) ⬇⬇
@router.post("/login")
@router.post("/login/", include_in_schema=False)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=user.email, role=user.role)
    return {"access_token": token, "token_type": "bearer"}

# Quién soy (con token)
@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return user

# (opcional) listar usuarios (solo admin)
@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), user=Depends(require_roles("admin"))):
    return db.query(User).order_by(User.id.asc()).all()
