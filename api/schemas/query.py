from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Request model for RAG query endpoint."""
    query: str = Field(..., description="User query or question regarding BIS standards.")
    top_k: Optional[int] = Field(default=None, description="Number of context chunks to retrieve.")


class SourceDocument(BaseModel):
    """Source reference metadata schema."""
    source: Optional[str] = Field(default=None, description="PDF file name.")
    page: Optional[int] = Field(default=None, description="PDF page number.")
    chunk_id: Optional[str] = Field(default=None, description="Unique chunk identifier.")
    score: Optional[float] = Field(default=None, description="Similarity score or distance metric.")


class QueryResponse(BaseModel):
    """Response model for RAG query endpoint."""
    query: str = Field(..., description="Original user query.")
    answer: str = Field(..., description="Generated answer from RAG pipeline.")
    sources: List[SourceDocument] = Field(default_factory=list, description="Retrieved source document references.")
