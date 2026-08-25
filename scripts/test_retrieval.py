#!/usr/bin/env python3
"""Script stub for testing context retrieval."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.retrieval.retriever import Retriever


def main():
    test_query = "What is the permissible limit for turbidity in drinking water according to IS 10500?"
    print(f"[Test Retrieval]: Testing retrieval for query: '{test_query}'")
    print(f"[Test Retrieval]: Configured Top-K: {config.TOP_K}")
    print("Retrieval test script ready.")


if __name__ == "__main__":
    main()
