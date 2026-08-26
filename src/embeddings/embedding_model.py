import logging
import numpy as np
from typing import List, Optional, Union
from src.config import config

logger = logging.getLogger(__name__)


class EmbeddingModel:
    """SentenceTransformer embedding generator supporting BAAI/bge-small-en-v1.5,
    batch generation, CPU/GPU execution, and normalized vector output.
    """

    def __init__(
        self,
        model_name: Optional[str] = None,
        device: Optional[str] = None,
        batch_size: Optional[int] = None
    ):
        self.model_name = model_name or config.EMBEDDING_MODEL
        self.device = device or config.DEVICE
        self.batch_size = batch_size or config.EMBEDDING_BATCH_SIZE
        self._model = None

    def _load_model(self):
        """Lazy load SentenceTransformer model onto target device."""
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer '{self.model_name}' on device '{self.device}'...")
            self._model = SentenceTransformer(self.model_name, device=self.device)
            logger.info(f"Successfully loaded '{self.model_name}'. Embedding dimension: {self._model.get_sentence_embedding_dimension()}")

    @property
    def embedding_dimension(self) -> int:
        """Return the vector dimension of the loaded embedding model."""
        self._load_model()
        return self._model.get_sentence_embedding_dimension()

    def embed_texts(
        self,
        texts: List[str],
        batch_size: Optional[int] = None,
        show_progress_bar: bool = True
    ) -> np.ndarray:
        """Generate batch embeddings for a list of text strings.
        
        Args:
            texts: List of text strings to embed.
            batch_size: Override batch size.
            show_progress_bar: Whether to display tqdm progress bar.
            
        Returns:
            np.ndarray: 2D numpy matrix of shape (len(texts), embedding_dim), float32.
        """
        if not texts:
            return np.empty((0, self.embedding_dimension), dtype=np.float32)

        self._load_model()
        bs = batch_size or self.batch_size

        # Note: BAAI/bge models perform best when embeddings are L2 normalized for Cosine/Inner-Product search
        embeddings = self._model.encode(
            texts,
            batch_size=bs,
            show_progress_bar=show_progress_bar,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        return np.ascontiguousarray(embeddings, dtype=np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        """Generate normalized embedding vector for a single query string.
        
        Args:
            query: User search query string.
            
        Returns:
            np.ndarray: 1D numpy vector of shape (embedding_dim,), float32.
        """
        if not query:
            raise ValueError("Query string cannot be empty.")

        self._load_model()
        # For BAAI/bge models, queries can optionally include instruction prefix if required,
        # but bge-small-en-v1.5 standard encode works out-of-the-box.
        embedding = self._model.encode(
            query,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        return np.ascontiguousarray(embedding, dtype=np.float32)
