from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .core.database import Base, engine
from . import models  # asegura que __init__ importa todos los modelos

from .routers import (
    auth, patients, appointments, plans, assessments, assignments, files, realtime
)

def init_db():
    Base.metadata.create_all(bind=engine)  # DEV: en prod usar Alembic

app = FastAPI(title="FonoApp Suite API", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# Cada router ya define su prefix internamente (p. ej., /auth)
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(plans.router)
app.include_router(assessments.router)
app.include_router(assignments.router)
app.include_router(files.router)
app.include_router(realtime.router)

app.mount("/media", StaticFiles(directory="backend/storage"), name="media")

@app.get("/health")
def health():
    return {"status": "ok"}
