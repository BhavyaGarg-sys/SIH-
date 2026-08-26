#!/usr/bin/env python3
"""Script 4: Context Retrieval Testing CLI.

Accepts an optional query string argument:
    python scripts/test_retrieval.py "your question here"

Searches FAISS vector store and prints formatted Top-K results (Rank, Score, Document, Page, Chunk ID, Text).
"""
import sys
import logging
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.retrieval.retriever import Retriever

logging.basicConfig(level=logging.WARNING)


def main():
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "What is the acceptable limit for turbidity in drinking water according to IS 10500?"

    print("=" * 70)
    print("BIS CONTEXT RETRIEVAL TEST")
    print("=" * 70)
    print(f"Query  : '{query}'")
    print(f"Top-K  : {config.TOP_K}")
    print("-" * 70)

    try:
        retriever = Retriever()
        results = retriever.retrieve(query, top_k=config.TOP_K)
    except Exception as e:
        print(f"\n[Error]: Could not perform retrieval: {e}")
        print("Ensure you have run scripts/ingest_documents.py, build_embeddings.py, and build_vectorstore.py.")
        sys.exit(1)

    if not results:
        print("\nNo relevant documents retrieved.")
        return

    print(f"\nFound {len(results)} matching chunks:\n")
    for idx, item in enumerate(results, start=1):
        print(f"RESULT {idx}")
        print(f"Score   : {item['score']:.4f}")
        print(f"Document: {item['source']} (Doc ID: {item['document_id']})")
        print(f"Page    : {item['page']}")
        print(f"Chunk ID: {item['chunk_id']}")
        print("-" * 40)
        print("Text:")
        print(item['text'].strip())
        print("=" * 70)


if __name__ == "__main__":
    main()
