# backend/app/main.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.api import triage, queue, patients
from app.db.session import init_db
from app.core.config import settings
from app.core.exceptions import TriageException


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown (add cleanup here if needed)


app = FastAPI(
    title="AI Triage System",
    description="Emergency triage classification and queue management",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(TriageException)
async def triage_exception_handler(request: Request, exc: TriageException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message, "code": exc.code},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "code": "INTERNAL_ERROR"},
    )

#Routers 
app.include_router(triage.router,   prefix="/api/v1", tags=["triage"])
app.include_router(queue.router,    prefix="/api/v1", tags=["queue"])
app.include_router(patients.router, prefix="/api/v1", tags=["patients"])

# Health check 
@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "version": app.version}
