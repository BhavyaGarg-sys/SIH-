from fastapi import FastAPI
from api.routes.query import router as query_router

app = FastAPI(
    title="BIS Document RAG QA API",
    description="Question-answering API system for Bureau of Indian Standards (BIS) technical documents.",
    version="0.1.0"
)

# Include API routes
app.include_router(query_router)


@app.get("/")
async def root():
    """Healthcheck & API welcome root endpoint."""
    return {
        "status": "healthy",
        "service": "BIS RAG QA API",
        "version": "0.1.0"
    }
