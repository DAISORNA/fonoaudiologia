from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import auth, patients, appointments, plans, assessments, assignments, files, realtime
from .core.config import settings

app = FastAPI(title="FonoApp Suite API", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(patients.router, prefix="/patients", tags=["patients"])
app.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
app.include_router(plans.router, prefix="/plans", tags=["plans"])
app.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
app.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(realtime.router, prefix="/realtime", tags=["realtime"])

# Static files for uploaded content
app.mount("/media", StaticFiles(directory="backend/storage"), name="media")

@app.get("/health")
def health():
    return {"status": "ok"}
