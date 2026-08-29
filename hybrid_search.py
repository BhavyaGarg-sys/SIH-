import math
import re
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import numpy as np


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
        chunk_scores = []

        for chunk in chunks:
            score = chunk.get("_rag_metadata", {}).get("relevance_score", 0.0)
            
            # Individual Chunk Relevance Filter
            if score >= self.min_chunk_score:
                passed_chunks.append(chunk)
                chunk_scores.append(score)

        if not passed_chunks:
            return False, 0.0, []

        # Calculate weighted average confidence score
        aggregate_confidence = float(np.mean(chunk_scores))
        
        # Determine if total context is sufficient for LLM prompt context
        is_valid = aggregate_confidence >= self.min_aggregate_confidence

        return is_valid, round(aggregate_confidence, 4), passed_chunks


class HybridSearchRAGWithRelevanceChecker:
    """
    Universal Hybrid Search Retriever (BM25 + Dense Vector + Re-ranking) 
    integrated with an explicit Relevance Checker gate.
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
        self.avgdl = 0.0
        self.doc_lengths: List[int] = []
        self.doc_freqs: List[Dict[str, int]] = []
        self.df: Dict[str, int] = {}

    @staticmethod
    def _default_tokenizer(text: str) -> List[str]:
        return re.findall(r"\w+", text.lower())

    def add_chunks(
        self, 
        chunks: List[Dict[str, Any]], 
        text_key: Union[str, Callable[[Dict[str, Any]], str]] = "text"
    ):
        """Index chunks into dense vector matrix and sparse BM25 inverted index."""
        if not chunks:
            return

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

        # 2. Build BM25 Vocabulary Index
        total_len = sum(self.doc_lengths)
        self.doc_count += len(new_texts)

        for text in new_texts:
            tokens = self._default_tokenizer(text)
            length = len(tokens)
            self.doc_lengths.append(length)
            total_len += length

            freqs: Dict[str, int] = {}
            for token in tokens:
                freqs[token] = freqs.get(token, 0) + 1
            self.doc_freqs.append(freqs)

            for token in freqs.keys():
                self.df[token] = self.df.get(token, 0) + 1

        self.avgdl = total_len / self.doc_count if self.doc_count > 0 else 0.0

    def _get_bm25_scores(self, query_tokens: List[str], k1: float = 1.5, b: float = 0.75) -> np.ndarray:
        scores = np.zeros(self.doc_count)
        for token in query_tokens:
            if token not in self.df:
                continue

            df_val = self.df[token]
            idf = math.log((self.doc_count - df_val + 0.5) / (df_val + 0.5) + 1.0)

            for doc_idx, freqs in enumerate(self.doc_freqs):
                tf = freqs.get(token, 0)
                if tf == 0:
                    continue
                doc_len = self.doc_lengths[doc_idx]
                numerator = tf * (k1 + 1)
                denominator = tf + k1 * (1 - b + b * (doc_len / self.avgdl))
                scores[doc_idx] += idf * (numerator / denominator)
        return scores

    @staticmethod
    def _min_max_scale(scores: np.ndarray) -> np.ndarray:
        """Min-Max normalizes search score arrays into [0.0, 1.0]."""
        min_v, max_v = np.min(scores), np.max(scores)
        if max_v - min_v == 0:
            return np.zeros_like(scores)
        return (scores - min_v) / (max_v - min_v)

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

        # Step 2: Execute Dense Vector Search
        query_vec = self.query_embedder_fn(query)
        query_vec = query_vec / max(np.linalg.norm(query_vec), 1e-12)
        raw_vector = np.dot(self.embeddings, query_vec)
        norm_vector = (raw_vector + 1.0) / 2.0  # Scale cosine from [-1, 1] to [0, 1]

        # Step 3: Compute Combined Relevance Score & Fusion Candidates
        candidates = []
        for idx in range(self.doc_count):
            composite_score = (alpha * norm_vector[idx]) + ((1.0 - alpha) * norm_bm25[idx])
            candidates.append({"idx": idx, "score": composite_score})

        candidates.sort(key=lambda x: x["score"], reverse=True)
        top_candidates = candidates[:top_k * 3]

        # Step 4: Cross-Encoder Neural Re-ranking (if provider supplied)
        indices = [item["idx"] for item in top_candidates]
        candidate_texts = [self.corpus_texts[idx] for idx in indices]

        if self.reranker_fn and candidate_texts:
            rerank_scores = self.reranker_fn(query, candidate_texts)
            for i, score in enumerate(rerank_scores):
                top_candidates[i]["score"] = float(score)
            top_candidates.sort(key=lambda x: x["score"], reverse=True)

        # Step 5: Format Chunks with Token Budget Constraints
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