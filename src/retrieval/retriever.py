import logging
import hashlib
import json
import numpy as np
import redis
from typing import List, Dict, Any, Optional

from src.embeddings.embedding_model import EmbeddingModel
from src.vectorstore.faiss_store import FAISSStore
from src.config import config

logger = logging.getLogger(__name__)

class Retriever:
    """Retriever engine matching user queries against FAISS vector store with Tier 2 caching."""

    def __init__(
        self,
        embedding_model: Optional[EmbeddingModel] = None,
        vector_store: Optional[FAISSStore] = None,
        redis_host: str = "localhost",
        redis_port: int = 6379,
        redis_db: int = 0
    ):
        self.embedding_model = embedding_model or EmbeddingModel()
        self.vector_store = vector_store or FAISSStore()
        
        # In-memory fallback
        self._memory_cache: Dict[str, str] = {}
        
        # Redis connection
        try:
            self._redis = redis.Redis(host=redis_host, port=redis_port, db=redis_db, socket_timeout=0.5)
            self._redis.ping()
            self._use_redis = True
            logger.info("Connected to Redis for Tier 2 caching.")
        except (redis.ConnectionError, redis.TimeoutError) as e:
            logger.warning(f"Redis connection failed: {e}. Falling back to in-memory dictionary cache.")
            self._use_redis = False

    def _generate_cache_key(self, query_vec: np.ndarray) -> str:
        """Generates a deterministic Redis key schema by rounding and hashing the vector."""
        # Normalize micro-variations across near-identical embedding spaces
        rounded_vec = np.round(query_vec, 3)
        vec_bytes = rounded_vec.tobytes()
        sha256_hash = hashlib.sha256(vec_bytes).hexdigest()
        return f"t2_retrieval:{sha256_hash}"
        
    def _get_cache(self, key: str) -> Optional[List[Dict[str, Any]]]:
        """Perform an O(1) look-up in Redis or fallback dictionary."""
        try:
            if self._use_redis:
                cached_data = self._redis.get(key)
                if cached_data:
                    return json.loads(cached_data)
            else:
                cached_data = self._memory_cache.get(key)
                if cached_data:
                    return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Error reading from cache: {e}")
        return None
        
    def _set_cache(self, key: str, data: List[Dict[str, Any]], ttl: int = 1800):
        """Write the returned payload to Redis with an explicit TTL."""
        try:
            serialized_data = json.dumps(data)
            if self._use_redis:
                self._redis.set(key, serialized_data, ex=ttl)
            else:
                self._memory_cache[key] = serialized_data
                # Note: Dictionary cache doesn't inherently support TTL without custom cleanup loop
        except Exception as e:
            logger.error(f"Error writing to cache: {e}")

    def retrieve(self, query: str, top_k: Optional[int] = None) -> List[Dict[str, Any]]:
        """Retrieve top-K relevant document chunks for a query string."""
        k = top_k or config.TOP_K
        if not query or not query.strip():
            logger.warning("Empty query passed to Retriever.")
            return []

        # 1. Embed user query using identical model
        query_vec = self.embedding_model.embed_query(query.strip())
        
        # 2. Deterministic Vector Keying
        cache_key = self._generate_cache_key(query_vec)
        
        # 3. Cache Execution Logic (Tier 2)
        cached_result = self._get_cache(cache_key)
        if cached_result is not None:
            logger.info(f"[Tier 2 Hit] Retrieved {len(cached_result)} chunks from cache for key {cache_key[:20]}...")
            return cached_result
            
        logger.info(f"[Tier 2 Miss] Executing FAISS search for key {cache_key[:20]}...")

        # 4. Perform FAISS vector search on cache miss
        search_results = self.vector_store.search(query_vec, top_k=k)

        # 5. Format result objects
        retrieved_items = []
        for metadata, score in search_results:
            item = {
                "text": metadata.get("text", ""),
                "source": metadata.get("source", ""),
                "page": metadata.get("page", 1),
                "document_id": metadata.get("document_id", ""),
                "chunk_id": metadata.get("chunk_id", ""),
                "score": float(score)
            }
            retrieved_items.append(item)
            
        # 6. Writeback to cache
        self._set_cache(cache_key, retrieved_items, ttl=1800)

        return retrieved_items

if __name__ == "__main__":
    # Minimal execution block to verify hit/miss paths
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    print("Testing Tier 2 Caching Retriever...")
    retriever = Retriever()
    
    query = "What is the acceptable limit for pH in drinking water?"
    print(f"\n--- First Call (Expect [Tier 2 Miss]) ---")
    results1 = retriever.retrieve(query)
    
    print(f"\n--- Second Call (Expect [Tier 2 Hit]) ---")
    results2 = retriever.retrieve(query)
    
    print(f"\nResults match: {results1 == results2}")
