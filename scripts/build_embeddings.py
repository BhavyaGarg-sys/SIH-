#!/usr/bin/env python3
"""Script 2: Embedding Generation Pipeline.

Loads chunks from data/processed/chunks.json, generates batch embeddings using
SentenceTransformers (BAAI/bge-small-en-v1.5), and saves embeddings matrix to data/processed/embeddings.npy.
"""
import sys
import json
import logging
import numpy as np
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.embeddings.embedding_model import EmbeddingModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def main():
    print("=" * 60)
    print("STAGE 2: EMBEDDING GENERATION")
    print("=" * 60)

    chunks_file = config.DATA_PROCESSED_PATH / "chunks.json"
    if not chunks_file.exists():
        print(f"[Error]: Processed chunks file not found at {chunks_file}. Run scripts/ingest_documents.py first.")
        sys.exit(1)

    with open(chunks_file, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    if not chunks:
        print("[Error]: No chunks found in chunks.json.")
        sys.exit(1)

    print(f"Loaded {len(chunks)} chunks from {chunks_file.name}.")
    texts = [c.get("text", "") for c in chunks]

    print(f"Initializing Embedding Model '{config.EMBEDDING_MODEL}' on device '{config.DEVICE}'...")
    embedder = EmbeddingModel()
    
    print(f"Generating embeddings in batches (batch_size={config.EMBEDDING_BATCH_SIZE})...")
    embeddings = embedder.embed_texts(texts, show_progress_bar=True)

    embeddings_file = config.DATA_PROCESSED_PATH / "embeddings.npy"
    np.save(embeddings_file, embeddings)

    print("\n" + "=" * 60)
    print("STAGE 2 COMPLETED SUCCESSFULLY")
    print(f" - Model Used          : {config.EMBEDDING_MODEL}")
    print(f" - Compute Device      : {config.DEVICE}")
    print(f" - Embeddings Matrix   : {embeddings.shape} (N_chunks x Dim)")
    print(f" - Vector Dimension    : {embeddings.shape[1]}")
    print(f" - Saved Output To     : {embeddings_file.resolve()}")
    print("=" * 60)


if __name__ == "__main__":
    main()
