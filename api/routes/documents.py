"""Authenticated serving of source documents used by RAG citations."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse

from api.core.deps import get_current_user


router = APIRouter()
RAW_DOCUMENTS_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"


def get_document_path(filename: str) -> Path:
    """Resolve a single PDF filename without permitting directory traversal."""
    candidate = Path(filename)
    if (
        not filename
        or candidate.name != filename
        or candidate.suffix.lower() != ".pdf"
        or filename in {".", ".."}
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A PDF filename is required.")

    document_path = (RAW_DOCUMENTS_DIR / candidate.name).resolve()
    if document_path.parent != RAW_DOCUMENTS_DIR.resolve() or not document_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return document_path


@router.get("/{filename}")
async def get_document(filename: str, _: dict = Depends(get_current_user)):
    """Return a RAG source PDF only after validating the caller's JWT."""
    document_path = get_document_path(filename)
    return FileResponse(document_path, media_type="application/pdf", filename=document_path.name)
