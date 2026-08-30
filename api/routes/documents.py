"""Serving of source documents (PDFs and TXTs) used by RAG citations."""

from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

router = APIRouter()
RAW_DOCUMENTS_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"

def get_document_path(filename: str) -> Path:
    """Resolve a single document filename, searching recursively in raw dir."""
    candidate = Path(filename)
    if not filename or candidate.name != filename or filename in {".", ".."}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A valid filename is required.")

    # Search recursively for the filename
    for file_path in RAW_DOCUMENTS_DIR.rglob("*"):
        if file_path.is_file() and file_path.name == candidate.name:
            return file_path
            
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

@router.get("/{filename}")
async def get_document(filename: str):
    """Return a RAG source document."""
    document_path = get_document_path(filename)
    media_type = "application/pdf" if document_path.suffix.lower() == ".pdf" else "text/plain"
    return FileResponse(document_path, media_type=media_type, filename=document_path.name)
