"""
Standalone tests for HybridSearchRAGWithRelevanceChecker & RelevanceChecker.

Uses lightweight mock embedders (bag-of-words vectors) so no GPU, API key,
or sentence-transformers install is required — only numpy.
"""

import numpy as np
import pytest
from hybrid_search import HybridSearchRAGWithRelevanceChecker, RelevanceChecker


# ── Helpers ──────────────────────────────────────────────────────────
VOCAB = [
    "water", "quality", "standard", "ph", "testing",
    "concrete", "strength", "cement", "steel", "grade",
    "safety", "food", "packaging", "limit", "bureau",
    "temperature", "pressure", "pipe", "electrical", "wiring",
]


def _bow_vector(text: str) -> np.ndarray:
    """Deterministic bag-of-words vector over a fixed 20-word vocab."""
    tokens = set(text.lower().split())
    return np.array([1.0 if w in tokens else 0.0 for w in VOCAB], dtype=np.float64)


def mock_embedder(texts: list[str]) -> np.ndarray:
    return np.array([_bow_vector(t) for t in texts])


def mock_query_embedder(text: str) -> np.ndarray:
    return _bow_vector(text)


# ── Sample corpus ────────────────────────────────────────────────────
SAMPLE_CHUNKS = [
    {"id": "c1", "text": "Water quality standard requires pH between 6.5 and 8.5 for drinking water testing"},
    {"id": "c2", "text": "Concrete strength testing standard for grade M20 cement"},
    {"id": "c3", "text": "Steel grade standard for structural safety"},
    {"id": "c4", "text": "Food packaging safety limit standard by bureau"},
    {"id": "c5", "text": "Electrical wiring safety standard for temperature and pressure pipe"},
]


# =====================================================================
# 1. RelevanceChecker unit tests
# =====================================================================

class TestRelevanceChecker:
    def test_empty_chunks_returns_invalid(self):
        rc = RelevanceChecker()
        is_valid, conf, passed = rc.check_relevance("anything", [])
        assert is_valid is False
        assert conf == 0.0
        assert passed == []

    def test_all_chunks_below_threshold(self):
        rc = RelevanceChecker(min_chunk_score=0.5)
        chunks = [
            {"_rag_metadata": {"relevance_score": 0.1}},
            {"_rag_metadata": {"relevance_score": 0.2}},
        ]
        is_valid, conf, passed = rc.check_relevance("query", chunks)
        assert is_valid is False
        assert passed == []

    def test_some_chunks_pass_individual_filter(self):
        rc = RelevanceChecker(min_chunk_score=0.3, min_aggregate_confidence=0.0)
        chunks = [
            {"_rag_metadata": {"relevance_score": 0.1}, "id": "low"},
            {"_rag_metadata": {"relevance_score": 0.5}, "id": "high"},
        ]
        is_valid, conf, passed = rc.check_relevance("query", chunks)
        assert is_valid is True
        assert len(passed) == 1
        assert passed[0]["id"] == "high"

    def test_aggregate_confidence_gate(self):
        rc = RelevanceChecker(min_chunk_score=0.1, min_aggregate_confidence=0.8)
        chunks = [
            {"_rag_metadata": {"relevance_score": 0.5}},
            {"_rag_metadata": {"relevance_score": 0.6}},
        ]
        # Mean = 0.55, below 0.8 threshold
        is_valid, conf, passed = rc.check_relevance("query", chunks)
        assert is_valid is False
        assert len(passed) == 2  # individual chunks still pass
        assert 0.54 < conf < 0.56

    def test_high_confidence_passes(self):
        rc = RelevanceChecker(min_chunk_score=0.3, min_aggregate_confidence=0.5)
        chunks = [
            {"_rag_metadata": {"relevance_score": 0.9}},
            {"_rag_metadata": {"relevance_score": 0.8}},
        ]
        is_valid, conf, passed = rc.check_relevance("query", chunks)
        assert is_valid is True
        assert conf == 0.85
        assert len(passed) == 2


# =====================================================================
# 2. HybridSearchRAGWithRelevanceChecker integration tests
# =====================================================================

class TestHybridSearch:
    @pytest.fixture()
    def searcher(self):
        """Build a fresh hybrid search instance with mock embedders."""
        hs = HybridSearchRAGWithRelevanceChecker(
            embedder_fn=mock_embedder,
            query_embedder_fn=mock_query_embedder,
            reranker_fn=None,
            relevance_checker=RelevanceChecker(
                min_chunk_score=0.05,          # Very lenient for BoW scores
                min_aggregate_confidence=0.05,
            ),
            rrf_k=60,
        )
        hs.add_chunks(SAMPLE_CHUNKS, text_key="text")
        return hs

    # ── Index sanity ─────────────────────────────────────────────────
    def test_index_populated(self, searcher):
        assert searcher.doc_count == 5
        assert searcher.embeddings.shape == (5, len(VOCAB))
        assert len(searcher.corpus_texts) == 5

    # ── Basic retrieval returns results ──────────────────────────────
    def test_basic_retrieval_returns_results(self, searcher):
        result = searcher.retrieve("water quality pH testing", top_k=3)
        assert result["passed"] is True
        assert result["confidence_score"] > 0
        assert len(result["chunks"]) > 0

    # ── Top result relevance ────────────────────────────────────────
    def test_top_result_is_most_relevant(self, searcher):
        result = searcher.retrieve("water quality pH testing", top_k=3)
        top_chunk = result["chunks"][0]
        # The water-quality chunk should rank highest
        assert top_chunk["id"] == "c1"

    # ── Different queries surface different chunks ───────────────────
    def test_different_queries_surface_different_chunks(self, searcher):
        r1 = searcher.retrieve("water quality pH testing", top_k=1)
        r2 = searcher.retrieve("concrete cement strength grade", top_k=1)
        assert r1["chunks"][0]["id"] != r2["chunks"][0]["id"]
        assert r2["chunks"][0]["id"] == "c2"

    # ── Empty index ──────────────────────────────────────────────────
    def test_empty_index_returns_failure(self):
        hs = HybridSearchRAGWithRelevanceChecker(
            embedder_fn=mock_embedder,
            query_embedder_fn=mock_query_embedder,
        )
        result = hs.retrieve("anything")
        assert result["passed"] is False
        assert "empty" in result["reason"].lower()

    # ── Token budget is respected ────────────────────────────────────
    def test_token_budget_limits_output(self, searcher):
        # Set a tiny budget so only ~1 chunk can fit
        result = searcher.retrieve("water quality pH testing", top_k=5, max_token_budget=25)
        total_tokens = sum(c["_rag_metadata"]["estimated_tokens"] for c in result["chunks"])
        assert total_tokens <= 25

    # ── Relevance gate actually rejects garbage ──────────────────────
    def test_strict_gate_rejects_weak_results(self):
        strict_checker = RelevanceChecker(
            min_chunk_score=0.99,
            min_aggregate_confidence=0.99,
        )
        hs = HybridSearchRAGWithRelevanceChecker(
            embedder_fn=mock_embedder,
            query_embedder_fn=mock_query_embedder,
            relevance_checker=strict_checker,
        )
        hs.add_chunks(SAMPLE_CHUNKS, text_key="text")
        result = hs.retrieve("completely unrelated gibberish xyz abc")
        assert result["passed"] is False
        assert result["chunks"] == []

    # ── Metadata fields present ──────────────────────────────────────
    def test_rag_metadata_fields_present(self, searcher):
        result = searcher.retrieve("food packaging safety", top_k=2)
        if result["passed"]:
            for chunk in result["chunks"]:
                meta = chunk["_rag_metadata"]
                assert "relevance_score" in meta
                assert "estimated_tokens" in meta
                assert "text" in meta

    # ── Custom reranker integration ──────────────────────────────────
    def test_reranker_overrides_scores(self):
        """A reranker that always pushes the last chunk to the top."""
        def reverse_reranker(query: str, texts: list[str]) -> list[float]:
            n = len(texts)
            return [float(i) / n for i in range(n)]  # ascending → last chunk wins

        hs = HybridSearchRAGWithRelevanceChecker(
            embedder_fn=mock_embedder,
            query_embedder_fn=mock_query_embedder,
            reranker_fn=reverse_reranker,
            relevance_checker=RelevanceChecker(min_chunk_score=0.01, min_aggregate_confidence=0.01),
        )
        hs.add_chunks(SAMPLE_CHUNKS, text_key="text")
        result = hs.retrieve("water quality pH testing", top_k=3)
        assert result["passed"] is True
        # With the ascending reranker, the original top-1 chunk (c1) should NOT be first anymore
        assert result["chunks"][0]["id"] != "c1"

    # ── BM25 alone works (alpha=0) ───────────────────────────────────
    def test_bm25_only_mode(self, searcher):
        result = searcher.retrieve("water quality pH testing", top_k=3, alpha=0.0)
        assert result["passed"] is True
        assert result["chunks"][0]["id"] == "c1"

    # ── Dense only (alpha=1) ─────────────────────────────────────────
    def test_dense_only_mode(self, searcher):
        result = searcher.retrieve("water quality pH testing", top_k=3, alpha=1.0)
        assert result["passed"] is True
        assert len(result["chunks"]) > 0
