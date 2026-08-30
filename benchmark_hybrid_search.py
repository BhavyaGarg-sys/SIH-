"""
Benchmark: measures query latency of the optimized hybrid search at scale.
Generates a synthetic corpus of N documents and times retrieval operations.
"""

import time
import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hybrid_search import HybridSearchRAGWithRelevanceChecker, RelevanceChecker

DIM = 64  # embedding dimension


def mock_embedder(texts: list[str]) -> np.ndarray:
    """Deterministic pseudo-random embeddings seeded by text hash."""
    vecs = np.zeros((len(texts), DIM), dtype=np.float64)
    for i, t in enumerate(texts):
        rng = np.random.RandomState(hash(t) % (2**31))
        vecs[i] = rng.randn(DIM)
    return vecs


def mock_query_embedder(text: str) -> np.ndarray:
    rng = np.random.RandomState(hash(text) % (2**31))
    return rng.randn(DIM)


def generate_corpus(n: int) -> list[dict]:
    """Generate n synthetic BIS-standard-like chunks."""
    topics = [
        "water quality testing pH standard bureau limit",
        "concrete cement strength grade structural safety M20",
        "steel grade carbon tensile yield strength",
        "food packaging safety limit temperature storage",
        "electrical wiring insulation resistance testing",
        "paint coating adhesion thickness standard",
        "pipe pressure rating diameter flow rate",
        "textile fiber tensile strength fabric quality",
        "chemical reagent purity grade analysis testing",
        "construction brick compressive strength clay",
    ]
    chunks = []
    for i in range(n):
        base = topics[i % len(topics)]
        text = f"{base} document_{i} section_{i % 50} clause_{i % 200}"
        chunks.append({"id": f"c{i}", "text": text})
    return chunks


def benchmark(n_docs: int, n_queries: int = 50, top_k: int = 5):
    print(f"\n{'='*60}")
    print(f"  Benchmark: {n_docs:,} documents, {n_queries} queries, top_k={top_k}")
    print(f"{'='*60}")

    searcher = HybridSearchRAGWithRelevanceChecker(
        embedder_fn=mock_embedder,
        query_embedder_fn=mock_query_embedder,
        relevance_checker=RelevanceChecker(min_chunk_score=0.01, min_aggregate_confidence=0.01),
    )

    # Indexing
    corpus = generate_corpus(n_docs)
    t0 = time.perf_counter()
    searcher.add_chunks(corpus, text_key="text")
    t_index = time.perf_counter() - t0
    print(f"  Indexing time:        {t_index*1000:>8.1f} ms")

    # Queries
    queries = [
        "water quality pH standard",
        "concrete strength testing",
        "steel grade carbon",
        "food safety packaging",
        "electrical wiring insulation",
        "paint adhesion thickness",
        "pipe pressure flow",
        "textile fabric quality",
        "chemical purity analysis",
        "brick compressive construction",
    ]
    # Repeat queries to get n_queries total
    test_queries = (queries * ((n_queries // len(queries)) + 1))[:n_queries]

    latencies = []
    for q in test_queries:
        t0 = time.perf_counter()
        result = searcher.retrieve(q, top_k=top_k)
        latencies.append(time.perf_counter() - t0)

    latencies_ms = [l * 1000 for l in latencies]
    p50 = sorted(latencies_ms)[len(latencies_ms) // 2]
    p95 = sorted(latencies_ms)[int(len(latencies_ms) * 0.95)]
    p99 = sorted(latencies_ms)[int(len(latencies_ms) * 0.99)]
    avg = sum(latencies_ms) / len(latencies_ms)

    print(f"  Avg query latency:    {avg:>8.2f} ms")
    print(f"  P50 query latency:    {p50:>8.2f} ms")
    print(f"  P95 query latency:    {p95:>8.2f} ms")
    print(f"  P99 query latency:    {p99:>8.2f} ms")
    print(f"  Total query time:     {sum(latencies_ms):>8.1f} ms  ({n_queries} queries)")


if __name__ == "__main__":
    benchmark(100)
    benchmark(1_000)
    benchmark(5_000)
    benchmark(10_000)
