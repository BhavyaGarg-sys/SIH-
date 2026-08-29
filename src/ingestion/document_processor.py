import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Cleaner for technical BIS documents.
    
    Removes layout/extraction artifacts while preserving all numbers, technical terms,
    clause designations, units, punctuation, and structural headings.
    """

    def clean_text(self, text: str) -> str:
        """Clean raw extracted PDF text.
        
        Args:
            text: Raw text string extracted from a PDF page.
            
        Returns:
            str: Cleaned technical text string.
        """
        if not text:
            return ""

        # 1. Remove non-printable control characters (except newline, tab)
        cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)

        # 2. Replace weird Unicode spaces (e.g. non-breaking space \xa0) with standard space
        cleaned = cleaned.replace('\xa0', ' ')

        # 3. Replace multiple horizontal whitespace spaces/tabs with single space (preserve newlines)
        cleaned = re.sub(r'[ \t]+', ' ', cleaned)

        # 4. Remove excessive consecutive blank lines (limit to double newline for paragraph boundaries)
        cleaned = re.sub(r'\n\s*\n\s*\n+', '\n\n', cleaned)

        # 5. Strip leading/trailing whitespace
        cleaned = cleaned.strip()

        return cleaned

    def process_pages(self, raw_pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process and clean a list of page dicts.
        
        Args:
            raw_pages: List of dicts containing 'document_id', 'source', 'page', 'text'.
            
        Returns:
            List[Dict]: List of cleaned page dicts.
        """
        processed_pages = []
        for page_data in raw_pages:
            cleaned_text = self.clean_text(page_data.get("text", ""))
            if cleaned_text:  # Only keep non-empty pages
                processed_pages.append({
                    "document_id": page_data.get("document_id"),
                    "source": page_data.get("source"),
                    "page": page_data.get("page"),
                    "text": cleaned_text
                })

        logger.info(f"Cleaned {len(processed_pages)} pages out of {len(raw_pages)} raw pages.")
        return processed_pages
