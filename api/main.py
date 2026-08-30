from dotenv import load_dotenv
load_dotenv()
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes.auth import router as auth_router
from api.routes.chat import router as chat_router
from api.routes.projects import router as projects_router
from api.routes.data import router as data_router
from api.routes.bookmarks import router as bookmarks_router
from api.routes.dashboard import router as dashboard_router
from api.routes.collaborators import router as collaborators_router
from api.routes.reports import router as reports_router
from api.routes.documents import router as documents_router
from api.core.database import connect_to_mongo, close_mongo_connection
from api.core.logging_middleware import LoggingMiddleware


def get_allowed_origins() -> list[str]:
    """Return explicit browser origins; never combine credentialed CORS with *."""
    configured = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173")
    origins = [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]
    if not origins or "*" in origins:
        raise RuntimeError("ALLOWED_ORIGINS must contain one or more explicit origins and cannot include '*'.")
    return origins


allowed_origins = get_allowed_origins()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="M?naK AI - Compliance Tracker API",
    description="Backend API for the SIH BIS Compliance Platform",
    version="0.2.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(data_router, prefix="/api/v1/data", tags=["Domain Data"])
app.include_router(bookmarks_router, prefix="/api/v1/bookmarks", tags=["Bookmarks"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(collaborators_router, prefix="/api/v1/projects", tags=["Collaborators"])
app.include_router(reports_router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(documents_router, prefix="/pdfs", tags=["Documents"])

@app.get("/")
async def root():
    """Healthcheck & API welcome root endpoint."""
    return {
        "status": "healthy",
        "service": "MānaK AI API",
        "version": "0.2.0"
    }
