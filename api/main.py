from dotenv import load_dotenv
load_dotenv()
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
from api.core.database import connect_to_mongo, close_mongo_connection

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Include API routes
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(data_router, prefix="/api/v1/data", tags=["Domain Data"])
app.include_router(bookmarks_router, prefix="/api/v1/bookmarks", tags=["Bookmarks"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(collaborators_router, prefix="/api/v1/projects", tags=["Collaborators"])
app.include_router(reports_router, prefix="/api/v1/reports", tags=["Reports"])

# Mount static files for PDFs
docs_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
app.mount("/pdfs", StaticFiles(directory=docs_path), name="pdfs")

@app.get("/")
async def root():
    """Healthcheck & API welcome root endpoint."""
    return {
        "status": "healthy",
        "service": "MānaK AI API",
        "version": "0.2.0"
    }
