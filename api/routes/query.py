from fastapi import APIRouter
from api.schemas.query import QueryRequest, QueryResponse, SourceDocument
from src.retrieval.retriever import Retriever
from src.generation.llm_wrapper import LLMWrapper
from src.generation.prompt import format_rag_prompt

router = APIRouter(prefix="", tags=["Query"])

# Initialize RAG components (in a real app, this might be dependency injected)
retriever = Retriever()
llm = LLMWrapper()


@router.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest) -> QueryResponse:
    """Endpoint for RAG query processing."""
    
    # 1. Retrieve context
    results = retriever.retrieve(request.query, top_k=request.top_k or 4)
    
    # 2. Extract text chunks and prepare source metadata
    context_texts = []
    sources = []
    for res in results:
        context_texts.append(res['text'])
        sources.append(
            SourceDocument(
                source=res.get('source', 'Unknown'),
                page=res.get('page', 0),
                chunk_id=res.get('chunk_id', 'unknown_chunk'),
                score=res.get('score', 0.0)
            )
        )
        
    # 3. Format prompt
    prompt = format_rag_prompt(query=request.query, context_chunks=context_texts)
    
    # 4. Generate Answer
    answer = llm.generate(prompt)
    
    return QueryResponse(
        query=request.query,
        answer=answer,
        sources=sources
    )
