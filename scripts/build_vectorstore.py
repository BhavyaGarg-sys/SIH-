#!/usr/bin/env python3
"""Script 3: FAISS Vectorstore Indexing & Persistence.

Loads embeddings matrix from data/processed/embeddings.npy and metadata chunks from
data/processed/chunks.json, builds a FAISS index, and persists index & metadata under data/vectorstore/.
"""
import sys
import json
import logging
import numpy as np
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.vectorstore.faiss_store import FAISSStore

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def main():
    print("=" * 60)
    print("STAGE 3: FAISS VECTOR STORE INDEXING")
    print("=" * 60)

    chunks_file = config.DATA_PROCESSED_PATH / "chunks.json"
    embeddings_file = config.DATA_PROCESSED_PATH / "embeddings.npy"

    if not chunks_file.exists() or not embeddings_file.exists():
        print(f"[Error]: Missing input files. Ensure scripts/ingest_documents.py and scripts/build_embeddings.py have been executed.")
        sys.exit(1)

    with open(chunks_file, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    embeddings = np.load(embeddings_file)

    if len(chunks) != len(embeddings):
        print(f"[Error]: Chunk count ({len(chunks)}) does not match embeddings count ({len(embeddings)}).")
        sys.exit(1)

    print(f"Building FAISS Index for {len(embeddings)} vectors of dimension {embeddings.shape[1]}...")
    store = FAISSStore(config.VECTORSTORE_PATH)
    store.create_index(embeddings, chunks)

    print(f"Persisting FAISS index to {config.VECTORSTORE_PATH.resolve()}...")
    store.save("index")

    print("\n" + "=" * 60)
    print("STAGE 3 COMPLETED SUCCESSFULLY")
    print(f" - Index Type          : IndexFlatIP (Inner Product / Cosine Similarity)")
    print(f" - Total Vectors Index : {store.index.ntotal}")
    print(f" - Vector Dimension    : {embeddings.shape[1]}")
    print(f" - Persisted Index File: {(config.VECTORSTORE_PATH / 'index.faiss').resolve()}")
    print(f" - Persisted Metadata  : {(config.VECTORSTORE_PATH / 'index_meta.pkl').resolve()}")
    print("=" * 60)


if __name__ == "__main__":
    main()
