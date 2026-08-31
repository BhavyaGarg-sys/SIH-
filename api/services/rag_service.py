from typing import Tuple, List
from src.retrieval.retriever import Retriever
from src.generation.llm_wrapper import LLMWrapper
from src.generation.prompt import format_rag_prompt
from api.schemas.chat import Citation

# Initialize ML models globally inside the service layer
# This ensures they only load into memory once when the app starts
_retriever = Retriever()

import numpy as np
from api.core.cache import cache_manager

_llm = LLMWrapper()

def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

async def generate_rag_response(query: str, top_k: int = 3, user_profile: dict = None) -> Tuple[str, List[Citation]]:
    # Profile context string
    profile_str = ""
    if user_profile and user_profile.get('profile_complete'):
        profile_str = f"[User context: {user_profile.get('industry_sector', 'User')} in {user_profile.get('state', 'India')}, Company: {user_profile.get('company_name', 'Unknown')}]\n"
        query = profile_str + query

    # 1. Semantic Caching
    # We fetch the list of recent queries to check for semantic similarity
    cached_queries = await cache_manager.get("recent_llm_queries") or []
    
    query_emb = _retriever.embedding_model.embed_query(query)
    
    # Check for hit > 0.95 similarity
    for item in cached_queries:
        if cosine_similarity(query_emb, np.array(item['embedding'])) > 0.95:
            print(f"[SEMANTIC CACHE HIT] Matching query: {item['query'][:30]}...")
            cached_res = await cache_manager.get(f"llm_res_{item['hash']}")
            if cached_res:
                # Reconstruct Citations
                cits = [Citation(**c) for c in cached_res['citations']]
                return cached_res['text'], cits
                
    print(f"[SEMANTIC CACHE MISS] Generating new response...")

    # 1. Fetch relevant context from Vector DB
    results = _retriever.retrieve(query, top_k=top_k)
    
    # 2. Extract texts and format citations
    context_texts = [res['text'] for res in results]
    citations = [
        Citation(
            standard=res.get('source', 'Unknown Document'),
            clause=res.get('source', 'Unknown Document').replace('.pdf', '').replace('_', ' ')
        ) for res in results
    ]
    
    # Prepend user profile context if available
    if user_profile and user_profile.get('profile_complete'):
        profile_str = f"[User context: {user_profile.get('industry_sector', 'User')} in {user_profile.get('state', 'India')}, Company: {user_profile.get('company_name', 'Unknown')}]\n"
        query = profile_str + query
    
# 3. Format prompt and generate AI text
    prompt = format_rag_prompt(query=query, context_chunks=context_texts)
    ai_text = _llm.generate(prompt)
    
    # Save to semantic cache
    import hashlib
    query_hash = hashlib.sha256(query.encode()).hexdigest()
    
    # Store response
    await cache_manager.set(f"llm_res_{query_hash}", {
        "text": ai_text,
        "citations": [c.dict() for c in citations]
    }, ttl=86400) # 24h
    
    # Update query list (keep last 100)
    cached_queries.append({
        "query": query,
        "embedding": query_emb.tolist(),
        "hash": query_hash
    })
    if len(cached_queries) > 100:
        cached_queries.pop(0)
    await cache_manager.set("recent_llm_queries", cached_queries, ttl=86400)
    
    return ai_text, citations



import json

async def stream_rag_response(query: str, top_k: int = 3, user_profile: dict = None):
    profile_str = ""
    if user_profile and user_profile.get('profile_complete'):
        profile_str = f"[User context: {user_profile.get('industry_sector', 'User')} in {user_profile.get('state', 'India')}, Company: {user_profile.get('company_name', 'Unknown')}]\n"
        query = profile_str + query
        
    query_emb = _retriever.embedding_model.embed_query(query)
    is_hit, cached_text, cached_citations = False, None, []
    
    if cache_manager.is_connected():
        try:
            cached_history = await cache_manager.get("recent_llm_queries")
            if cached_history:
                for entry in cached_history:
                    if cosine_similarity(query_emb, np.array(entry['embedding'])) > 0.95:
                        is_hit = True
                        cached_text = entry['text']
                        cached_citations = [Citation(**c) for c in entry['citations']]
                        break
        except Exception as e:
            logger.warning(f"Semantic cache error: {e}")
            
    # Yield citations immediately as the first event
    if is_hit:
        citations = cached_citations
    else:
        results = _retriever.search(query, top_k=top_k)
        citations = [
            Citation(
                standard=res.metadata.get("source", "Unknown Standard"),
                clause=res.metadata.get("clause", "General"),
                snippet=res.text[:200] + "...",
                page=str(res.metadata.get("page", ""))
            ) for res in results
        ]
        
    yield f"data: {json.dumps({'citations': [c.dict() for c in citations]})}\n\n"
    
    if is_hit:
        # Simulate streaming the cached response
        yield f"data: {json.dumps({'chunk': cached_text})}\n\n"
        return
        
    context_texts = "\n\n".join([res.text for res in results])
    prompt = format_rag_prompt(query=query, context_chunks=context_texts)
    
    full_text = ""
    async for chunk in _llm.astream(prompt):
        full_text += chunk
        # Send chunk
        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        
    # Save to semantic cache
    if cache_manager.is_connected():
        try:
            cached_history = await cache_manager.get("recent_llm_queries") or []
            cached_history.append({
                "embedding": query_emb.tolist(),
                "text": full_text,
                "citations": [c.dict() for c in citations]
            })
            if len(cached_history) > 100:
                cached_history = cached_history[-100:]
            await cache_manager.set("recent_llm_queries", cached_history, expire=3600*24)
        except Exception as e:
            logger.warning(f"Failed to update semantic cache: {e}")
