import numpy as np
from src.vectorstore.faiss_store import FAISSStore
from src.retrieval.retriever import Retriever


def test_faiss_store_persistence_and_reload(tmp_path):
    store = FAISSStore(index_dir=tmp_path)
    
    # 2 synthetic normalized vectors of dim 4
    v1 = np.array([1.0, 0.0, 0.0, 0.0], dtype=np.float32)
    v2 = np.array([0.0, 1.0, 0.0, 0.0], dtype=np.float32)
    embeddings = np.array([v1, v2], dtype=np.float32)

    metadata = [
        {"chunk_id": "c1", "document_id": "d1", "source": "IS_1.pdf", "page": 1, "text": "Water pH 6.5-8.5"},
        {"chunk_id": "c2", "document_id": "d2", "source": "IS_2.pdf", "page": 2, "text": "Concrete slump 75mm"}
    ]

    store.create_index(embeddings, metadata)
    store.save("test_index")

    # Reload store from disk
    new_store = FAISSStore(index_dir=tmp_path)
    loaded = new_store.load("test_index")

    assert loaded is True
    assert new_store.index.ntotal == 2

    # Query search
    query_vec = np.array([0.9, 0.1, 0.0, 0.0], dtype=np.float32)
    results = new_store.search(query_vec, top_k=1)

    assert len(results) == 1
    assert results[0][0]["chunk_id"] == "c1"
    assert results[0][0]["source"] == "IS_1.pdf"
