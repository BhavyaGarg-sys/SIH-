from typing import Tuple, List
from src.retrieval.retriever import Retriever
from src.generation.llm_wrapper import LLMWrapper
from src.generation.prompt import format_rag_prompt
from api.schemas.chat import Citation

# Initialize ML models globally inside the service layer
# This ensures they only load into memory once when the app starts
_retriever = Retriever()

_llm = LLMWrapper()

# Simple in-memory cache for LLM responses
_llm_cache = {}

async def generate_rag_response(query: str, top_k: int = 3, user_profile: dict = None) -> Tuple[str, List[Citation]]:
    # Build cache key based on query and user profile
    profile_key = str(sorted(user_profile.items())) if user_profile else ""
    cache_key = f"{query}_{top_k}_{profile_key}"
    
    if cache_key in _llm_cache:
        print(f"[LLM CACHE HIT] Returning cached response for: {query[:30]}...")
        return _llm_cache[cache_key]
        
    print(f"[LLM CACHE MISS] Generating new response for: {query[:30]}...")

    """
    Internal service function to orchestrate the RAG pipeline.
    Retrieves context from FAISS and generates an answer using the LLM.
    """
    # 1. Fetch relevant context from Vector DB
    results = _retriever.retrieve(query, top_k=top_k)
    
    # 2. Extract texts and format citations
    context_texts = [res['text'] for res in results]
    citations = [
        Citation(
            standard=res.get('source', 'Unknown Document'),
            clause=f"Page {res.get('page', '?')}"
        ) for res in results
    ]
    
    # Prepend user profile context if available
    if user_profile and user_profile.get('profile_complete'):
        profile_str = f"[User context: {user_profile.get('industry_sector', 'User')} in {user_profile.get('state', 'India')}, Company: {user_profile.get('company_name', 'Unknown')}]\n"
        query = profile_str + query
    
    # 3. Format prompt and generate AI text
    prompt = format_rag_prompt(query=query, context_chunks=context_texts)
    ai_text = _llm.generate(prompt)
    
    # Store in cache
    _llm_cache[cache_key] = (ai_text, citations)
    
    return ai_text, citations
