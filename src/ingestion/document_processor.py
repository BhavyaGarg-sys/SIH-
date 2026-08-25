import re
from typing import List, Dict, Any


class DocumentProcessor:
    """Document cleaning and text normalization processor."""

    def clean_text(self, text: str) -> str:
        """Clean raw extracted PDF text."""
        if not text:
            return ""
        # Remove redundant whitespace and normalize line breaks
        cleaned = re.sub(r'\s+', ' ', text).strip()
        return cleaned

    def process_pages(self, raw_pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Clean extracted pages."""
        processed = []
        for page in raw_pages:
            cleaned_content = self.clean_text(page.get("content", ""))
            if cleaned_content:
                processed.append({
                    "source": page.get("source"),
                    "page_number": page.get("page_number"),
                    "content": cleaned_content
                })
        return processed
