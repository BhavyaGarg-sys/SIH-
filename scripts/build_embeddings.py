#!/usr/bin/env python3
"""Script stub for generating text chunks and embeddings."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.chunking.text_chunker import TextChunker
from src.embeddings.embedding_model import EmbeddingModel


def main():
    print(f"[Build Embeddings]: Initializing TextChunker (size={config.CHUNK_SIZE}, overlap={config.CHUNK_OVERLAP})")
    print(f"[Build Embeddings]: Initializing EmbeddingModel ({config.EMBEDDING_MODEL})")
    print("Embedding generation script ready.")


if __name__ == "__main__":
    main()
