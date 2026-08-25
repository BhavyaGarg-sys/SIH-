import logging
from typing import List, Dict, Any, Optional
from src.embeddings.embedding_model import EmbeddingModel
from src.vectorstore.faiss_store import FAISSStore
from src.config import config

logger = logging.getLogger(__name__)


class Retriever:
    """Retriever engine matching user queries against FAISS vector store."""

    def __init__(
        self,
        embedding_model: Optional[EmbeddingModel] = None,
        vector_store: Optional[FAISSStore] = None
    ):
        self.embedding_model = embedding_model or EmbeddingModel()
        self.vector_store = vector_store or FAISSStore()

    def retrieve(self, query: str, top_k: Optional[int] = None) -> List[Dict[str, Any]]:
        """Retrieve top-K relevant document chunks for a query string.
        
        Args:
            query: User search query string.
            top_k: Number of relevant chunks to retrieve. Defaults to config.TOP_K.
            
        Returns:
            List[Dict]: List of result dicts containing:
                        'text', 'source', 'page', 'document_id', 'chunk_id', 'score'.
        """
        k = top_k or config.TOP_K
        if not query or not query.strip():
            logger.warning("Empty query passed to Retriever.")
            return []

        # 1. Embed user query using identical model
        query_vec = self.embedding_model.embed_query(query.strip())

        # 2. Perform FAISS vector search
        search_results = self.vector_store.search(query_vec, top_k=k)

        # 3. Format result objects
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

        logger.info(f"Retrieved {len(retrieved_items)} relevant context chunks for query: '{query[:50]}...'")
        return retrieved_items
