from fastapi import APIRouter
from api.schemas.query import QueryRequest, QueryResponse, SourceDocument

router = APIRouter(prefix="", tags=["Query"])


@router.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest) -> QueryResponse:
    """Placeholder endpoint for RAG query processing.
    
    Future execution flow:
    Frontend -> FastAPI -> RAG Pipeline -> Retriever + LLM Wrapper
    """
    # Placeholder response before full RAG pipeline execution is wired
    return QueryResponse(
        query=request.query,
        answer=(
            f"[Placeholder Answer]: Received query '{request.query}'. "
            "RAG pipeline integration pending next development stage."
        ),
        sources=[
            SourceDocument(
                source="IS_10500_2012.pdf",
                page=1,
                chunk_id="IS_10500_2012.pdf_p1_c0",
                score=0.15
            )
        ]
    )
