from typing import Dict, Any, List
from src.retrieval.retriever import Retriever
from src.generation.llm_wrapper import LLMWrapper
from src.generation.prompt import format_rag_prompt
from src.config import config


class RAGPipeline:
    """Explicit RAG Pipeline connecting Retriever and LLMWrapper."""

    def __init__(self, retriever: Retriever = None, llm: LLMWrapper = None):
        self.retriever = retriever or Retriever()
        self.llm = llm or LLMWrapper()

    def run(self, query: str, top_k: int = None) -> Dict[str, Any]:
        """Execute end-to-end question answering pipeline."""
        # 1. Retrieve context
        retrieved_docs = self.retriever.retrieve(query, top_k=top_k or config.TOP_K)
        
        # 2. Extract context text content
        context_chunks = [doc.get("content", "") for doc in retrieved_docs]
        
        # 3. Format prompt
        prompt = format_rag_prompt(query, context_chunks)
        
        # 4. Generate answer
        answer = self.llm.generate(prompt)
        
        # 5. Extract source metadata
        sources = [
            {
                "source": doc.get("source"),
                "page": doc.get("page_number"),
                "chunk_id": doc.get("chunk_id"),
                "score": doc.get("score")
            }
            for doc in retrieved_docs
        ]
        
        return {
            "query": query,
            "answer": answer,
            "sources": sources
        }
