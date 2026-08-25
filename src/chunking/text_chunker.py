from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from src.config import config


class TextChunker:
    """Explicit chunking engine using RecursiveCharacterTextSplitter."""

    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or config.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or config.CHUNK_OVERLAP
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def chunk_document(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Split document pages into contextual text chunks."""
        chunks = []
        chunk_id = 0
        for page in pages:
            text = page.get("content", "")
            split_texts = self.splitter.split_text(text)
            for sub_id, text_chunk in enumerate(split_texts):
                chunks.append({
                    "chunk_id": f"{page.get('source')}_p{page.get('page_number')}_c{sub_id}",
                    "source": page.get("source"),
                    "page_number": page.get("page_number"),
                    "content": text_chunk
                })
                chunk_id += 1
        return chunks
