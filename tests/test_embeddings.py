import numpy as np
from src.embeddings.embedding_model import EmbeddingModel
from src.config import config


def test_embedding_model_bge_small_dimensions():
    model = EmbeddingModel(model_name="BAAI/bge-small-en-v1.5")
    assert model.embedding_dimension == 384

    texts = ["Turbidity limit is 1.0 NTU.", "Concrete slump requirement is 75 mm."]
    embeddings = model.embed_texts(texts, show_progress_bar=False)

    assert isinstance(embeddings, np.ndarray)
    assert embeddings.shape == (2, 384)
    # Check L2 normalization (norm approx 1.0)
    norm = np.linalg.norm(embeddings[0])
    assert abs(norm - 1.0) < 1e-4

    query_vec = model.embed_query("What is turbidity?")
    assert isinstance(query_vec, np.ndarray)
    assert query_vec.shape == (384,)
