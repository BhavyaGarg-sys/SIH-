import numpy as np
from src.vectorstore.faiss_store import FAISSStore


def test_faiss_store_creation_and_search():
    store = FAISSStore()
    # Synthetic 2D vectors
    embeddings = np.array([[1.0, 0.0], [0.0, 1.0]], dtype=np.float32)
    metadata = [
        {"content": "chunk 1", "source": "doc1.pdf"},
        {"content": "chunk 2", "source": "doc2.pdf"}
    ]
    store.create_index(embeddings, metadata)
    
    query_vec = np.array([1.0, 0.1], dtype=np.float32)
    results = store.search(query_vec, top_k=1)
    
    assert len(results) == 1
    assert results[0][0]["content"] == "chunk 1"
