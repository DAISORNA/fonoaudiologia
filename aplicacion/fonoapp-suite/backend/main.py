from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .core.database import Base, engine
from . import models  # asegura que los modelos se registren

from .routers import (
    auth, patients, appointments, plans, assessments, assignments, files, realtime
)

def init_db():
    Base.metadata.create_all(bind=engine)

app = FastAPI(title="FonoApp Suite API", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,   # <-- minúsculas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# ⚠️ Usa SOLO una fuente de prefijos:
# Opción A: si DENTRO de cada router ya definiste prefix=...
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(plans.router)
app.include_router(assessments.router)
app.include_router(assignments.router)
app.include_router(files.router)
app.include_router(realtime.router)

# Opción B (alternativa): si tus routers NO tienen prefix, usa:
# app.include_router(auth.router, prefix="/auth", tags=["auth"])
# app.include_router(patients.router, prefix="/patients", tags=["patients"])
# ... (y así con los demás)

# Archivos estáticos (uploads)
app.mount("/media", StaticFiles(directory="backend/storage"), name="media")

@app.get("/health")
def health():
    return {"status": "ok"}
