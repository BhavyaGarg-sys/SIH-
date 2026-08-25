#!/usr/bin/env python3
"""Script stub for building and persisting FAISS index."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.vectorstore.faiss_store import FAISSStore


def main():
    print(f"[Build Vectorstore]: Saving FAISS index to {config.VECTORSTORE_PATH}")
    store = FAISSStore()
    print("Vectorstore index script ready.")


if __name__ == "__main__":
    main()
