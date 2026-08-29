from pydantic import BaseModel
from typing import Optional

class BookmarkCreate(BaseModel):
    standard_ref: str
    clause_text: str
    pdf_path: Optional[str] = None
    page_number: Optional[int] = None
    note: Optional[str] = None

class BookmarkUpdate(BaseModel):
    note: Optional[str] = None

class BookmarkResponse(BaseModel):
    id: str
    standard_ref: str
    clause_text: str
    pdf_path: Optional[str] = None
    page_number: Optional[int] = None
    note: Optional[str] = None
    created_at: str
