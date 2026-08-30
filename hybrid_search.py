import math
import re
from collections import defaultdict
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import numpy as np


# Pre-compiled tokenizer regex — avoids re-compilation on every call
_TOKEN_RE = re.compile(r"\w+")


class RelevanceChecker:
    """
    Quality gate component for RAG pipelines. Evaluates retrieved document context 
    against the query to prevent hallucinations and ungrounded generation.
    """

    def __init__(
        self, 
        min_chunk_score: float = 0.35, 
        min_aggregate_confidence: float = 0.45
    ):
        """
        :param min_chunk_score: Minimum relevance score required for an individual chunk to be accepted.
        :param min_aggregate_confidence: Overall minimum confidence threshold for the entire context payload.
        """
        self.min_chunk_score = min_chunk_score
        self.min_aggregate_confidence = min_aggregate_confidence

    def check_relevance(
        self, 
        query: str, 
        chunks: List[Dict[str, Any]]
    ) -> Tuple[bool, float, List[Dict[str, Any]]]:
        """
        Filters and evaluates candidates based on relevance scores.

        Returns:
            - is_valid (bool): True if context passes quality gate, False if it fails.
            - confidence (float): Calculated aggregate relevance confidence (0.0 to 1.0).
            - passed_chunks (List[Dict]): Chunks that met individual relevance standards.
        """
        if not chunks:
            return False, 0.0, []

        passed_chunks = []
        score_sum = 0.0
        threshold = self.min_chunk_score

        for chunk in chunks:
            score = chunk.get("_rag_metadata", {}).get("relevance_score", 0.0)
            
            # Individual Chunk Relevance Filter
            if score >= threshold:
                passed_chunks.append(chunk)
                score_sum += score

        if not passed_chunks:
            return False, 0.0, []

        # Pure-python mean — faster than np.mean for small lists (avoids array allocation)
        aggregate_confidence = score_sum / len(passed_chunks)
        
        # Determine if total context is sufficient for LLM prompt context
        is_valid = aggregate_confidence >= self.min_aggregate_confidence

        return is_valid, round(aggregate_confidence, 4), passed_chunks


class HybridSearchRAGWithRelevanceChecker:
    """
    Universal Hybrid Search Retriever (BM25 + Dense Vector + Re-ranking) 
    integrated with an explicit Relevance Checker gate.

    Optimizations over naive implementation:
    - Inverted index for BM25: O(posting_list_length) per query token instead of O(N_docs).
    - Precomputed IDF values and BM25 length-normalization denominators at index time.
    - Vectorized numpy fusion scoring instead of Python loop + list-of-dicts.
    - O(n) partial sort via np.argpartition instead of O(n log n) full sort.
    - Compiled regex tokenizer.
    - Running total for avgdl (no recomputation on each add_chunks call).
    """

    def __init__(
        self,
        embedder_fn: Callable[[List[str]], np.ndarray],
        query_embedder_fn: Callable[[str], np.ndarray],
        reranker_fn: Optional[Callable[[str, List[str]], List[float]]] = None,
        relevance_checker: Optional[RelevanceChecker] = None,
        rrf_k: int = 60,
    ):
        self.embedder_fn = embedder_fn
        self.query_embedder_fn = query_embedder_fn
        self.reranker_fn = reranker_fn
        self.relevance_checker = relevance_checker or RelevanceChecker()
        self.rrf_k = rrf_k

        self.chunks: List[Dict[str, Any]] = []
        self.corpus_texts: List[str] = []
        self.embeddings: np.ndarray = np.array([])

        # BM25 Sparse Index State
        self.doc_count = 0
        self._total_doc_length = 0          # Running total — no recomputation needed
        self.avgdl = 0.0
        self.doc_lengths: List[int] = []
        self.doc_freqs: List[Dict[str, int]] = []
        self.df: Dict[str, int] = {}

        # === NEW: Inverted index and precomputed caches ===
        # Maps token → list of (doc_idx, term_frequency)
        self._inverted_index: Dict[str, List[Tuple[int, int]]] = defaultdict(list)
        # Precomputed IDF per token — invalidated on add_chunks
        self._idf_cache: Dict[str, float] = {}
        # Precomputed BM25 denominator per doc: k1 * (1 - b + b * dl/avgdl) — invalidated on add_chunks
        self._bm25_denom_cache: Optional[np.ndarray] = None
        # Track whether caches are stale
        self._cache_valid = False

    @staticmethod
    def _default_tokenizer(text: str) -> List[str]:
        return _TOKEN_RE.findall(text.lower())

    def _rebuild_bm25_caches(self, k1: float = 1.5, b: float = 0.75) -> None:
        """Precompute IDF values and per-document BM25 normalization denominators."""
        if self._cache_valid:
            return

        N = self.doc_count
        if N == 0:
            self._cache_valid = True
            return

        # Precompute IDF for every token in vocabulary
        idf_cache = {}
        for token, df_val in self.df.items():
            idf_cache[token] = math.log((N - df_val + 0.5) / (df_val + 0.5) + 1.0)
        self._idf_cache = idf_cache

        # Precompute BM25 length-normalization factor per document
        # denom_base[i] = k1 * (1 - b + b * doc_lengths[i] / avgdl)
        dl = np.array(self.doc_lengths, dtype=np.float64)
        self._bm25_denom_cache = k1 * (1.0 - b + b * (dl / self.avgdl)) if self.avgdl > 0 else np.full(N, k1)

        self._cache_valid = True

    def add_chunks(
        self, 
        chunks: List[Dict[str, Any]], 
        text_key: Union[str, Callable[[Dict[str, Any]], str]] = "text"
    ):
        """Index chunks into dense vector matrix and sparse BM25 inverted index."""
        if not chunks:
            return

        base_idx = self.doc_count  # Starting doc index for new chunks

        self.chunks.extend(chunks)
        new_texts = [text_key(c) if callable(text_key) else c[text_key] for c in chunks]
        self.corpus_texts.extend(new_texts)

        # 1. Store L2-Normalized Vector Embeddings
        new_vecs = self.embedder_fn(new_texts)
        norms = np.linalg.norm(new_vecs, axis=1, keepdims=True)
        new_vecs = new_vecs / np.maximum(norms, 1e-12)

        if self.embeddings.size == 0:
            self.embeddings = new_vecs
        else:
            self.embeddings = np.vstack([self.embeddings, new_vecs])

        # 2. Build BM25 Vocabulary Index + Inverted Index
        self.doc_count += len(new_texts)

        for offset, text in enumerate(new_texts):
            doc_idx = base_idx + offset
            tokens = self._default_tokenizer(text)
            length = len(tokens)
            self.doc_lengths.append(length)
            self._total_doc_length += length

            freqs: Dict[str, int] = {}
            for token in tokens:
                freqs[token] = freqs.get(token, 0) + 1
            self.doc_freqs.append(freqs)

            for token, tf in freqs.items():
                self.df[token] = self.df.get(token, 0) + 1
                # Append to inverted index: (doc_id, term_frequency)
                self._inverted_index[token].append((doc_idx, tf))

        self.avgdl = self._total_doc_length / self.doc_count if self.doc_count > 0 else 0.0

        # Invalidate precomputed BM25 caches
        self._cache_valid = False

    def _get_bm25_scores(self, query_tokens: List[str], k1: float = 1.5, b: float = 0.75) -> np.ndarray:
        """
        BM25 scoring using inverted index — O(sum of posting list lengths) 
        instead of O(Q × D) brute-force.
        """
        # Ensure caches are built
        self._rebuild_bm25_caches(k1, b)

        scores = np.zeros(self.doc_count, dtype=np.float64)
        idf_cache = self._idf_cache
        denom_base = self._bm25_denom_cache

        # Deduplicate query tokens to avoid redundant passes
        seen_tokens = set()

        for token in query_tokens:
            if token in seen_tokens:
                continue
            seen_tokens.add(token)

            if token not in idf_cache:
                continue

            idf = idf_cache[token]
            posting_list = self._inverted_index[token]

            # Only iterate over docs that actually contain this token
            for doc_idx, tf in posting_list:
                numerator = tf * (k1 + 1.0)
                denominator = tf + denom_base[doc_idx]
                scores[doc_idx] += idf * (numerator / denominator)

        return scores

    @staticmethod
    def _min_max_scale(scores: np.ndarray) -> np.ndarray:
        """Min-Max normalizes search score arrays into [0.0, 1.0]."""
        min_v = scores.min()
        max_v = scores.max()
        spread = max_v - min_v
        if spread == 0:
            return np.zeros_like(scores)
        return (scores - min_v) / spread

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        alpha: float = 0.5,
        max_token_budget: int = 2000
    ) -> Dict[str, Any]:
        """
        Performs hybrid search, formats metadata, and verifies relevance through the Relevance Checker gate.
        """
        if self.doc_count == 0:
            return {
                "passed": False,
                "confidence_score": 0.0,
                "chunks": [],
                "reason": "Index is empty."
            }

        # Step 1: Execute BM25 Sparse Search
        query_tokens = self._default_tokenizer(query)
        norm_bm25 = self._min_max_scale(self._get_bm25_scores(query_tokens))

        # Step 2: Execute Dense Vector Search (already vectorized)
        query_vec = self.query_embedder_fn(query)
        query_vec = query_vec / max(float(np.linalg.norm(query_vec)), 1e-12)
        raw_vector = self.embeddings @ query_vec        # matmul — same as np.dot but clearer intent
        norm_vector = (raw_vector + 1.0) * 0.5          # multiply is faster than divide

        # Step 3: Vectorized Fusion Scoring (replaces Python for-loop + list-of-dicts)
        composite_scores = (alpha * norm_vector) + ((1.0 - alpha) * norm_bm25)

        # Step 3b: O(n) partial sort to find top candidates (instead of full O(n log n) sort)
        n_candidates = min(top_k * 3, self.doc_count)

        if n_candidates < self.doc_count:
            # argpartition is O(n), gives the top-n_candidates indices (unordered)
            top_indices_unordered = np.argpartition(composite_scores, -n_candidates)[-n_candidates:]
            # Sort only the small top-k*3 subset
            top_scores = composite_scores[top_indices_unordered]
            sorted_order = np.argsort(top_scores)[::-1]
            top_indices = top_indices_unordered[sorted_order]
        else:
            # Corpus smaller than top_k*3 — just argsort everything
            top_indices = np.argsort(composite_scores)[::-1]

        top_scores_sorted = composite_scores[top_indices]

        # Step 4: Cross-Encoder Neural Re-ranking (if provider supplied)
        if self.reranker_fn and len(top_indices) > 0:
            candidate_texts = [self.corpus_texts[idx] for idx in top_indices]
            rerank_scores = np.array(self.reranker_fn(query, candidate_texts), dtype=np.float64)
            # Re-sort by reranker scores
            rerank_order = np.argsort(rerank_scores)[::-1]
            top_indices = top_indices[rerank_order]
            top_scores_sorted = rerank_scores[rerank_order]

        # Step 5: Format Chunks with Token Budget Constraints
        prepared_chunks = []
        current_tokens = 0

        for rank in range(min(top_k, len(top_indices))):
            idx = int(top_indices[rank])
            text = self.corpus_texts[idx]
            token_count = len(text) // 4

            if current_tokens + token_count > max_token_budget:
                continue

            current_tokens += token_count
            chunk_data = self.chunks[idx].copy()
            chunk_data["_rag_metadata"] = {
                "text": text,
                "relevance_score": round(float(top_scores_sorted[rank]), 4),
                "estimated_tokens": token_count
            }
            prepared_chunks.append(chunk_data)

        # Step 6: RUN RELEVANCE CHECKER GATE
        is_valid, confidence, verified_chunks = self.relevance_checker.check_relevance(query, prepared_chunks)

        if not is_valid:
            return {
                "passed": False,
                "confidence_score": confidence,
                "chunks": [],
                "reason": "Retrieved context failed the relevance checker gate threshold."
            }

        return {
            "passed": True,
            "confidence_score": confidence,
            "chunks": verified_chunks,
            "reason": "Context successfully verified by relevance checker."
        }