import numpy as np
from src.embeddings.embedding_model import EmbeddingModel


def test_embedding_model_instantiation():
    model = EmbeddingModel(model_name="all-MiniLM-L6-v2")
    assert model.model_name == "all-MiniLM-L6-v2"
