import faiss
import pickle
import logging
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
from src.config import config

logger = logging.getLogger(__name__)


class FAISSStore:
    """FAISS Vector Index manager supporting persistence, metadata mapping,
    and similarity search over document chunks.
    """

    def __init__(self, index_dir: Optional[Path] = None):
        self.index_dir = Path(index_dir or config.VECTORSTORE_PATH)
        self.index: Optional[faiss.Index] = None
        self.metadata: List[Dict[str, Any]] = []

    def create_index(self, embeddings: np.ndarray, metadata: List[Dict[str, Any]]):
        """Build FAISS IndexFlatIP index from numpy embeddings and metadata.
        
        Args:
            embeddings: 2D numpy array of shape (N, dim), float32.
            metadata: List of dicts matching vectors, each with
                      'chunk_id', 'document_id', 'source', 'page', 'text'.
        """
        if len(embeddings) != len(metadata):
            raise ValueError(f"Embeddings count ({len(embeddings)}) does not match metadata count ({len(metadata)}).")

        if len(embeddings) == 0:
            logger.warning("Empty embeddings array passed to FAISSStore.")
            return

        dimension = embeddings.shape[1]
        # Using IndexFlatIP (Inner Product) for normalized cosine similarity
        self.index = faiss.IndexFlatIP(dimension)
        
        vectors = np.ascontiguousarray(embeddings, dtype=np.float32)
        self.index.add(vectors)
        self.metadata = metadata
        logger.info(f"Created FAISS index with {self.index.ntotal} vectors of dimension {dimension}.")

    def search(self, query_embedding: np.ndarray, top_k: int = 4) -> List[Tuple[Dict[str, Any], float]]:
        """Search top-K nearest vectors for query embedding.
        
        Args:
            query_embedding: 1D or 2D query numpy array.
            top_k: Number of nearest neighbors to retrieve.
            
        Returns:
            List[Tuple[Dict, float]]: List of tuples containing (metadata_dict, similarity_score).
        """
        if self.index is None:
            # Auto-attempt load from disk if index is missing
            self.load()

        if self.index is None or self.index.ntotal == 0:
            logger.warning("FAISS index is empty or not initialized.")
            return []

        if query_embedding.ndim == 1:
            query_vector = np.ascontiguousarray([query_embedding], dtype=np.float32)
        else:
            query_vector = np.ascontiguousarray(query_embedding, dtype=np.float32)

        actual_k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(query_vector, actual_k)

        results = []
        for idx, score in zip(indices[0], scores[0]):
            if idx != -1 and idx < len(self.metadata):
                results.append((self.metadata[idx], float(score)))

        return results

    def save(self, index_name: str = "index"):
        """Persist FAISS index and metadata to disk under index_dir."""
        self.index_dir.mkdir(parents=True, exist_ok=True)
        index_file = self.index_dir / f"{index_name}.faiss"
        meta_file = self.index_dir / f"{index_name}_meta.pkl"

        if self.index is not None:
            faiss.write_index(self.index, str(index_file))
            with open(meta_file, "wb") as f:
                pickle.dump(self.metadata, f)
            logger.info(f"Successfully saved FAISS index ({self.index.ntotal} vectors) and metadata to {self.index_dir}.")
        else:
            logger.warning("Cannot save empty FAISS index.")

    def load(self, index_name: str = "index") -> bool:
        """Reload FAISS index and metadata from disk.
        
        Returns:
            bool: True if loaded successfully, False if index files missing.
        """
        index_file = self.index_dir / f"{index_name}.faiss"
        meta_file = self.index_dir / f"{index_name}_meta.pkl"

        if not index_file.exists() or not meta_file.exists():
            logger.warning(f"No existing FAISS index files found at '{self.index_dir}'.")
            return False

        try:
            self.index = faiss.read_index(str(index_file))
            with open(meta_file, "rb") as f:
                self.metadata = pickle.load(f)
            logger.info(f"Successfully loaded FAISS index ({self.index.ntotal} vectors) from '{self.index_dir}'.")
            return True
        except Exception as e:
            logger.error(f"Error loading FAISS index from '{self.index_dir}': {e}")
            return False
