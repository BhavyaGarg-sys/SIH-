import faiss
import pickle
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple
from src.config import config


class FAISSStore:
    """Explicit FAISS vector index manager."""

    def __init__(self, index_dir: Path = None):
        self.index_dir = index_dir or config.VECTORSTORE_PATH
        self.index = None
        self.metadata: List[Dict[str, Any]] = []

    def create_index(self, embeddings: np.ndarray, metadata: List[Dict[str, Any]]):
        """Create FAISS IndexFlatL2 from numpy embeddings matrix."""
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(np.ascontiguousarray(embeddings, dtype=np.float32))
        self.metadata = metadata

    def search(self, query_embedding: np.ndarray, top_k: int = 4) -> List[Tuple[Dict[str, Any], float]]:
        """Search top-K nearest neighbors."""
        if self.index is None:
            raise ValueError("FAISS index is not initialized or loaded.")
        
        query_vector = np.ascontiguousarray([query_embedding], dtype=np.float32)
        distances, indices = self.index.search(query_vector, top_k)
        
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx != -1 and idx < len(self.metadata):
                results.append((self.metadata[idx], float(dist)))
        return results

    def save(self, name: str = "bis_index"):
        """Save FAISS index and metadata to disk."""
        self.index_dir.mkdir(parents=True, exist_ok=True)
        index_file = self.index_dir / f"{name}.faiss"
        meta_file = self.index_dir / f"{name}_meta.pkl"

        if self.index is not None:
            faiss.write_index(self.index, str(index_file))
            with open(meta_file, "wb") as f:
                pickle.dump(self.metadata, f)

    def load(self, name: str = "bis_index"):
        """Load FAISS index and metadata from disk."""
        index_file = self.index_dir / f"{name}.faiss"
        meta_file = self.index_dir / f"{name}_meta.pkl"

        if not index_file.exists() or not meta_file.exists():
            raise FileNotFoundError(f"FAISS index files missing at {self.index_dir}")

        self.index = faiss.read_index(str(index_file))
        with open(meta_file, "rb") as f:
            self.metadata = pickle.load(f)
