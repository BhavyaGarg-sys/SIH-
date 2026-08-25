from typing import List
import numpy as np
from src.config import config


class EmbeddingModel:
    """Explicit embedding generation wrapper using sentence-transformers."""

    def __init__(self, model_name: str = None):
        self.model_name = model_name or config.EMBEDDING_MODEL
        self._model = None

    def _load_model(self):
        """Lazy load sentence transformer model."""
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings array for list of text strings."""
        self._load_model()
        embeddings = self._model.encode(texts, convert_to_numpy=True)
        return embeddings

    def embed_query(self, query: str) -> np.ndarray:
        """Generate embedding vector for single query string."""
        self._load_model()
        embedding = self._model.encode(query, convert_to_numpy=True)
        return embedding
