"""
Head-to-head benchmark: OLD (unoptimized) vs NEW (optimized) hybrid search.
Reconstructs the original naive implementation inline so we can compare directly.
"""

import math
import re
import time
import numpy as np
from collections import defaultdict
from typing import Any, Callable, Dict, List, Optional, Tuple, Union

# =====================================================================
# OLD IMPLEMENTATION (verbatim copy of pre-optimization code)
# =====================================================================

class OldRelevanceChecker:
    def __init__(self, min_chunk_score=0.35, min_aggregate_confidence=0.45):
        self.min_chunk_score = min_chunk_score
        self.min_aggregate_confidence = min_aggregate_confidence

    def check_relevance(self, query, chunks):
        if not chunks:
            return False, 0.0, []
        passed_chunks = []
        chunk_scores = []
        for chunk in chunks:
            score = chunk.get("_rag_metadata", {}).get("relevance_score", 0.0)
            if score >= self.min_chunk_score:
                passed_chunks.append(chunk)
                chunk_scores.append(score)
        if not passed_chunks:
            return False, 0.0, []
        aggregate_confidence = float(np.mean(chunk_scores))
        is_valid = aggregate_confidence >= self.min_aggregate_confidence
        return is_valid, round(aggregate_confidence, 4), passed_chunks


class OldHybridSearch:
    def __init__(self, embedder_fn, query_embedder_fn, reranker_fn=None,
                 relevance_checker=None, rrf_k=60):
        self.embedder_fn = embedder_fn
        self.query_embedder_fn = query_embedder_fn
        self.reranker_fn = reranker_fn
        self.relevance_checker = relevance_checker or OldRelevanceChecker()
        self.rrf_k = rrf_k
        self.chunks = []
        self.corpus_texts = []
        self.embeddings = np.array([])
        self.doc_count = 0
        self.avgdl = 0.0
        self.doc_lengths = []
        self.doc_freqs = []
        self.df = {}

    @staticmethod
    def _default_tokenizer(text):
        return re.findall(r"\w+", text.lower())

    def add_chunks(self, chunks, text_key="text"):
        if not chunks:
            return
        self.chunks.extend(chunks)
        new_texts = [c[text_key] for c in chunks]
        self.corpus_texts.extend(new_texts)
        new_vecs = self.embedder_fn(new_texts)
        norms = np.linalg.norm(new_vecs, axis=1, keepdims=True)
        new_vecs = new_vecs / np.maximum(norms, 1e-12)
        if self.embeddings.size == 0:
            self.embeddings = new_vecs
        else:
            self.embeddings = np.vstack([self.embeddings, new_vecs])
        total_len = sum(self.doc_lengths)  # <-- O(D) recomputation
        self.doc_count += len(new_texts)
        for text in new_texts:
            tokens = self._default_tokenizer(text)
            length = len(tokens)
            self.doc_lengths.append(length)
            total_len += length
            freqs = {}
            for token in tokens:
                freqs[token] = freqs.get(token, 0) + 1
            self.doc_freqs.append(freqs)
            for token in freqs.keys():
                self.df[token] = self.df.get(token, 0) + 1
        self.avgdl = total_len / self.doc_count if self.doc_count > 0 else 0.0

    def _get_bm25_scores(self, query_tokens, k1=1.5, b=0.75):
        scores = np.zeros(self.doc_count)
        for token in query_tokens:
            if token not in self.df:
                continue
            df_val = self.df[token]
            idf = math.log((self.doc_count - df_val + 0.5) / (df_val + 0.5) + 1.0)
            for doc_idx, freqs in enumerate(self.doc_freqs):  # <-- O(D) per token
                tf = freqs.get(token, 0)
                if tf == 0:
                    continue
                doc_len = self.doc_lengths[doc_idx]
                numerator = tf * (k1 + 1)
                denominator = tf + k1 * (1 - b + b * (doc_len / self.avgdl))
                scores[doc_idx] += idf * (numerator / denominator)
        return scores

    @staticmethod
    def _min_max_scale(scores):
        min_v, max_v = np.min(scores), np.max(scores)
        if max_v - min_v == 0:
            return np.zeros_like(scores)
        return (scores - min_v) / (max_v - min_v)

    def retrieve(self, query, top_k=5, alpha=0.5, max_token_budget=2000):
        if self.doc_count == 0:
            return {"passed": False, "confidence_score": 0.0, "chunks": [], "reason": "Index is empty."}
        query_tokens = self._default_tokenizer(query)
        norm_bm25 = self._min_max_scale(self._get_bm25_scores(query_tokens))
        query_vec = self.query_embedder_fn(query)
        query_vec = query_vec / max(np.linalg.norm(query_vec), 1e-12)
        raw_vector = np.dot(self.embeddings, query_vec)
        norm_vector = (raw_vector + 1.0) / 2.0
        candidates = []
        for idx in range(self.doc_count):  # <-- Python loop + dict allocation
            composite_score = (alpha * norm_vector[idx]) + ((1.0 - alpha) * norm_bm25[idx])
            candidates.append({"idx": idx, "score": composite_score})
        candidates.sort(key=lambda x: x["score"], reverse=True)  # <-- O(n log n)
        top_candidates = candidates[:top_k * 3]
        indices = [item["idx"] for item in top_candidates]
        candidate_texts = [self.corpus_texts[idx] for idx in indices]
        if self.reranker_fn and candidate_texts:
            rerank_scores = self.reranker_fn(query, candidate_texts)
            for i, score in enumerate(rerank_scores):
                top_candidates[i]["score"] = float(score)
            top_candidates.sort(key=lambda x: x["score"], reverse=True)
        prepared_chunks = []
        current_tokens = 0
        for item in top_candidates[:top_k]:
            idx = item["idx"]
            text = self.corpus_texts[idx]
            token_count = len(text) // 4
            if current_tokens + token_count > max_token_budget:
                continue
            current_tokens += token_count
            chunk_data = self.chunks[idx].copy()
            chunk_data["_rag_metadata"] = {
                "text": text,
                "relevance_score": round(item["score"], 4),
                "estimated_tokens": token_count
            }
            prepared_chunks.append(chunk_data)
        is_valid, confidence, verified_chunks = self.relevance_checker.check_relevance(query, prepared_chunks)
        if not is_valid:
            return {"passed": False, "confidence_score": confidence, "chunks": [],
                    "reason": "Retrieved context failed the relevance checker gate threshold."}
        return {"passed": True, "confidence_score": confidence, "chunks": verified_chunks,
                "reason": "Context successfully verified by relevance checker."}


# =====================================================================
# NEW IMPLEMENTATION (import from optimized file)
# =====================================================================
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hybrid_search import HybridSearchRAGWithRelevanceChecker as NewHybridSearch, RelevanceChecker as NewRelevanceChecker


# =====================================================================
# BENCHMARKING INFRASTRUCTURE
# =====================================================================

DIM = 64

def mock_embedder(texts):
    vecs = np.zeros((len(texts), DIM), dtype=np.float64)
    for i, t in enumerate(texts):
        rng = np.random.RandomState(hash(t) % (2**31))
        vecs[i] = rng.randn(DIM)
    return vecs

def mock_query_embedder(text):
    rng = np.random.RandomState(hash(text) % (2**31))
    return rng.randn(DIM)

QUERIES = [
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

def generate_corpus(n):
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


def time_queries(searcher, queries, n_runs=50):
    """Returns list of per-query latencies in ms."""
    test_queries = (queries * ((n_runs // len(queries)) + 1))[:n_runs]
    latencies = []
    for q in test_queries:
        t0 = time.perf_counter()
        searcher.retrieve(q, top_k=5)
        latencies.append((time.perf_counter() - t0) * 1000)
    return latencies


def percentile(data, p):
    sorted_data = sorted(data)
    idx = int(len(sorted_data) * p / 100)
    return sorted_data[min(idx, len(sorted_data) - 1)]


def run_comparison(n_docs, n_queries=50):
    corpus = generate_corpus(n_docs)

    # ── OLD ──
    old = OldHybridSearch(
        embedder_fn=mock_embedder,
        query_embedder_fn=mock_query_embedder,
        relevance_checker=OldRelevanceChecker(min_chunk_score=0.01, min_aggregate_confidence=0.01),
    )
    t0 = time.perf_counter()
    old.add_chunks(corpus, text_key="text")
    old_index_ms = (time.perf_counter() - t0) * 1000
    old_latencies = time_queries(old, QUERIES, n_queries)

    # ── NEW ──
    new = NewHybridSearch(
        embedder_fn=mock_embedder,
        query_embedder_fn=mock_query_embedder,
        relevance_checker=NewRelevanceChecker(min_chunk_score=0.01, min_aggregate_confidence=0.01),
    )
    t0 = time.perf_counter()
    new.add_chunks(corpus, text_key="text")
    new_index_ms = (time.perf_counter() - t0) * 1000
    new_latencies = time_queries(new, QUERIES, n_queries)

    # ── Correctness check ──
    for q in QUERIES[:3]:
        r_old = old.retrieve(q, top_k=3)
        r_new = new.retrieve(q, top_k=3)
        old_ids = [c["id"] for c in r_old["chunks"]]
        new_ids = [c["id"] for c in r_new["chunks"]]
        assert old_ids == new_ids, f"Result mismatch for '{q}': old={old_ids} new={new_ids}"

    return {
        "n_docs": n_docs,
        "old_index_ms": old_index_ms,
        "new_index_ms": new_index_ms,
        "old_avg": sum(old_latencies) / len(old_latencies),
        "new_avg": sum(new_latencies) / len(new_latencies),
        "old_p50": percentile(old_latencies, 50),
        "new_p50": percentile(new_latencies, 50),
        "old_p95": percentile(old_latencies, 95),
        "new_p95": percentile(new_latencies, 95),
        "old_p99": percentile(old_latencies, 99),
        "new_p99": percentile(new_latencies, 99),
    }


# =====================================================================
# COMPONENT-LEVEL PROFILING
# =====================================================================

def profile_components(n_docs=5000):
    """Break down where time is spent in each implementation."""
    corpus = generate_corpus(n_docs)
    query = "water quality pH standard testing"

    print(f"\n{'='*70}")
    print(f"  COMPONENT-LEVEL PROFILING ({n_docs:,} docs)")
    print(f"{'='*70}")

    # ── OLD components ──
    old = OldHybridSearch(
        embedder_fn=mock_embedder,
        query_embedder_fn=mock_query_embedder,
        relevance_checker=OldRelevanceChecker(min_chunk_score=0.01, min_aggregate_confidence=0.01),
    )
    old.add_chunks(corpus, text_key="text")

    # BM25
    qt = old._default_tokenizer(query)
    t0 = time.perf_counter()
    for _ in range(20):
        old._get_bm25_scores(qt)
    old_bm25 = (time.perf_counter() - t0) / 20 * 1000

    # Dense
    t0 = time.perf_counter()
    for _ in range(20):
        qv = old.query_embedder_fn(query)
        qv = qv / max(np.linalg.norm(qv), 1e-12)
        np.dot(old.embeddings, qv)
    old_dense = (time.perf_counter() - t0) / 20 * 1000

    # Fusion + sort
    norm_bm25 = old._min_max_scale(old._get_bm25_scores(qt))
    qv = old.query_embedder_fn(query)
    qv = qv / max(np.linalg.norm(qv), 1e-12)
    raw_vector = np.dot(old.embeddings, qv)
    norm_vector = (raw_vector + 1.0) / 2.0
    t0 = time.perf_counter()
    for _ in range(20):
        candidates = []
        for idx in range(old.doc_count):
            composite_score = (0.5 * norm_vector[idx]) + (0.5 * norm_bm25[idx])
            candidates.append({"idx": idx, "score": composite_score})
        candidates.sort(key=lambda x: x["score"], reverse=True)
        _ = candidates[:15]
    old_fusion = (time.perf_counter() - t0) / 20 * 1000

    # ── NEW components ──
    new = NewHybridSearch(
        embedder_fn=mock_embedder,
        query_embedder_fn=mock_query_embedder,
        relevance_checker=NewRelevanceChecker(min_chunk_score=0.01, min_aggregate_confidence=0.01),
    )
    new.add_chunks(corpus, text_key="text")

    qt2 = new._default_tokenizer(query)
    t0 = time.perf_counter()
    for _ in range(20):
        new._get_bm25_scores(qt2)
    new_bm25 = (time.perf_counter() - t0) / 20 * 1000

    # Dense (same for both)
    new_dense = old_dense

    # Fusion + argpartition
    norm_bm25_n = new._min_max_scale(new._get_bm25_scores(qt2))
    composite = 0.5 * norm_vector + 0.5 * norm_bm25_n
    t0 = time.perf_counter()
    n_cand = min(15, n_docs)
    for _ in range(20):
        if n_cand < n_docs:
            top_idx = np.argpartition(composite, -n_cand)[-n_cand:]
            top_scores = composite[top_idx]
            order = np.argsort(top_scores)[::-1]
            _ = top_idx[order]
        else:
            _ = np.argsort(composite)[::-1]
    new_fusion = (time.perf_counter() - t0) / 20 * 1000

    print(f"\n  {'Component':<25} {'OLD (ms)':>10} {'NEW (ms)':>10} {'Speedup':>10}")
    print(f"  {'-'*25} {'-'*10} {'-'*10} {'-'*10}")
    print(f"  {'BM25 Scoring':<25} {old_bm25:>10.3f} {new_bm25:>10.3f} {old_bm25/max(new_bm25, 0.001):>9.1f}x")
    print(f"  {'Dense Vector Search':<25} {old_dense:>10.3f} {new_dense:>10.3f} {'1.0x':>10}")
    print(f"  {'Fusion + Top-K Sort':<25} {old_fusion:>10.3f} {new_fusion:>10.3f} {old_fusion/max(new_fusion, 0.001):>9.1f}x")


# =====================================================================
# INCREMENTAL INDEXING BENCHMARK
# =====================================================================

def benchmark_incremental_indexing():
    """Test add_chunks performance: old recomputes sum(doc_lengths), new uses running total."""
    print(f"\n{'='*70}")
    print(f"  INCREMENTAL INDEXING BENCHMARK (100 batches × 100 chunks)")
    print(f"{'='*70}")

    batches = [generate_corpus(100) for _ in range(100)]

    # OLD
    old = OldHybridSearch(
        embedder_fn=mock_embedder, query_embedder_fn=mock_query_embedder,
        relevance_checker=OldRelevanceChecker(min_chunk_score=0.01, min_aggregate_confidence=0.01),
    )
    t0 = time.perf_counter()
    for batch in batches:
        old.add_chunks(batch, text_key="text")
    old_time = (time.perf_counter() - t0) * 1000

    # NEW
    new = NewHybridSearch(
        embedder_fn=mock_embedder, query_embedder_fn=mock_query_embedder,
        relevance_checker=NewRelevanceChecker(min_chunk_score=0.01, min_aggregate_confidence=0.01),
    )
    t0 = time.perf_counter()
    for batch in batches:
        new.add_chunks(batch, text_key="text")
    new_time = (time.perf_counter() - t0) * 1000

    print(f"\n  OLD incremental indexing: {old_time:>8.1f} ms")
    print(f"  NEW incremental indexing: {new_time:>8.1f} ms")
    print(f"  Speedup:                  {old_time/max(new_time, 0.001):>7.1f}x")


# =====================================================================
# MAIN
# =====================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("  OLD vs NEW — HEAD-TO-HEAD COMPARISON")
    print("=" * 70)

    sizes = [100, 500, 1_000, 5_000, 10_000]
    results = []
    for n in sizes:
        r = run_comparison(n, n_queries=50)
        results.append(r)
        print(f"  ✅ {n:>6,} docs — correctness verified")

    # Print comparison table
    print(f"\n{'='*70}")
    print(f"  QUERY LATENCY COMPARISON (50 queries each)")
    print(f"{'='*70}")
    print(f"\n  {'Docs':>7} │ {'OLD avg':>9} │ {'NEW avg':>9} │ {'Speedup':>8} │ {'OLD P95':>9} │ {'NEW P95':>9} │ {'P95 Speedup':>11}")
    print(f"  {'─'*7}─┼─{'─'*9}─┼─{'─'*9}─┼─{'─'*8}─┼─{'─'*9}─┼─{'─'*9}─┼─{'─'*11}")
    for r in results:
        speedup_avg = r["old_avg"] / max(r["new_avg"], 0.001)
        speedup_p95 = r["old_p95"] / max(r["new_p95"], 0.001)
        print(f"  {r['n_docs']:>7,} │ {r['old_avg']:>8.2f}ms │ {r['new_avg']:>8.2f}ms │ {speedup_avg:>7.1f}x │ {r['old_p95']:>8.2f}ms │ {r['new_p95']:>8.2f}ms │ {speedup_p95:>10.1f}x")

    print(f"\n  INDEXING TIME COMPARISON")
    print(f"  {'Docs':>7} │ {'OLD':>10} │ {'NEW':>10} │ {'Speedup':>8}")
    print(f"  {'─'*7}─┼─{'─'*10}─┼─{'─'*10}─┼─{'─'*8}")
    for r in results:
        sp = r["old_index_ms"] / max(r["new_index_ms"], 0.001)
        print(f"  {r['n_docs']:>7,} │ {r['old_index_ms']:>9.1f}ms │ {r['new_index_ms']:>9.1f}ms │ {sp:>7.1f}x")

    # Component-level profiling
    profile_components(5000)

    # Incremental indexing
    benchmark_incremental_indexing()

    print(f"\n{'='*70}")
    print("  ALL BENCHMARKS COMPLETE")
    print(f"{'='*70}\n")
