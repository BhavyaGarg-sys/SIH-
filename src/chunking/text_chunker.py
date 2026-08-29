import logging
from typing import List, Dict, Any, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
from src.config import config

logger = logging.getLogger(__name__)


class TextChunker:
    """Recursive text chunker preserving document & page metadata hierarchy."""

    def __init__(self, chunk_size: Optional[int] = None, chunk_overlap: Optional[int] = None):
        self.chunk_size = chunk_size or config.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or config.CHUNK_OVERLAP
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def chunk_pages(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Split page texts into contextual chunks with rich metadata.
        
        Args:
            pages: List of page dicts with 'document_id', 'source', 'page', 'text'.
            
        Returns:
            List[Dict]: Chunks containing 'chunk_id', 'document_id', 'source', 'page', 'text'.
        """
        chunks = []
        for page_data in pages:
            doc_id = page_data.get("document_id", "unknown_doc")
            source = page_data.get("source", "unknown_source")
            page_num = page_data.get("page", 1)
            text = page_data.get("text", "")

            if not text:
                continue

            split_texts = self.splitter.split_text(text)
            for chunk_idx, text_chunk in enumerate(split_texts):
                chunk_id = f"{doc_id}_p{page_num}_c{chunk_idx + 1}"
                chunks.append({
                    "chunk_id": chunk_id,
                    "document_id": doc_id,
                    "source": source,
                    "page": page_num,
                    "text": text_chunk
                })

        logger.info(f"Generated {len(chunks)} text chunks from {len(pages)} pages (chunk_size={self.chunk_size}, overlap={self.chunk_overlap}).")
        return chunks
