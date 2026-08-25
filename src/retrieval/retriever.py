from typing import List, Dict, Any
from src.embeddings.embedding_model import EmbeddingModel
from src.vectorstore.faiss_store import FAISSStore
from src.config import config


class Retriever:
    """Explicit Retriever connecting EmbeddingModel and FAISSStore."""

    def __init__(self, embedding_model: EmbeddingModel = None, vector_store: FAISSStore = None):
        self.embedding_model = embedding_model or EmbeddingModel()
        self.vector_store = vector_store or FAISSStore()

    def retrieve(self, query: str, top_k: int = None) -> List[Dict[str, Any]]:
        """Retrieve relevant context chunks for a user query."""
        k = top_k or config.TOP_K
        query_vec = self.embedding_model.embed_query(query)
        search_results = self.vector_store.search(query_vec, top_k=k)
        
        retrieved_items = []
        for metadata, score in search_results:
            item = dict(metadata)
            item["score"] = score
            retrieved_items.append(item)
        return retrieved_items
