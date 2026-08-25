import fitz  # PyMuPDF
import hashlib
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from src.config import config

logger = logging.getLogger(__name__)


class PDFLoader:
    """PyMuPDF loader for BIS PDF documents."""

    def __init__(self, raw_dir: Optional[Path] = None):
        self.raw_dir = Path(raw_dir or config.DATA_RAW_PATH)

    @staticmethod
    def generate_document_id(file_path: Path) -> str:
        """Generate a stable document_id based on filename and contents."""
        name_clean = file_path.stem.replace(" ", "_")
        hash_digest = hashlib.md5(file_path.name.encode('utf-8')).hexdigest()[:8]
        return f"doc_{name_clean}_{hash_digest}"

    def load_single_pdf(self, pdf_path: Path) -> List[Dict[str, Any]]:
        """Extract page-by-page text from a single PDF file.
        
        Args:
            pdf_path: Path to the PDF file.
            
        Returns:
            List[Dict]: List of pages with metadata (document_id, source, page, text).
        """
        if not pdf_path.exists():
            logger.error(f"PDF file does not exist: {pdf_path}")
            return []

        doc_id = self.generate_document_id(pdf_path)
        pages = []

        try:
            doc = fitz.open(pdf_path)
            if doc.is_encrypted:
                logger.warning(f"Encrypted PDF detected: {pdf_path.name}. Attempting default password authentication...")
                if not doc.authenticate(""):
                    logger.error(f"Failed to decrypt PDF: {pdf_path.name}. Skipping.")
                    return []

            for page_idx in range(len(doc)):
                page = doc.load_page(page_idx)
                text = page.get_text("text")
                pages.append({
                    "document_id": doc_id,
                    "source": pdf_path.name,
                    "page": page_idx + 1,
                    "text": text or ""
                })
            doc.close()
            logger.info(f"Successfully extracted {len(pages)} pages from '{pdf_path.name}' (doc_id: {doc_id}).")
        except Exception as e:
            logger.error(f"Error reading PDF file '{pdf_path.name}': {e}. Skipping file without interrupting pipeline.")
            return []

        return pages

    def load_all_pdfs(self) -> Dict[str, Any]:
        """Automatically discover and load all PDFs inside raw_dir.
        
        Returns:
            Dict[str, Any]: Container with 'all_pages', 'processed_files_count', and 'failed_files'.
        """
        if not self.raw_dir.exists():
            logger.warning(f"Directory {self.raw_dir} does not exist. Creating it.")
            self.raw_dir.mkdir(parents=True, exist_ok=True)
            return {"all_pages": [], "documents_processed": 0, "failed_files": []}

        pdf_files = sorted(list(self.raw_dir.glob("*.pdf")))
        logger.info(f"Found {len(pdf_files)} PDF documents in '{self.raw_dir}'.")

        all_pages = []
        failed_files = []
        documents_processed = 0

        for pdf_path in pdf_files:
            pages = self.load_single_pdf(pdf_path)
            if pages:
                all_pages.extend(pages)
                documents_processed += 1
            else:
                failed_files.append(pdf_path.name)

        return {
            "all_pages": all_pages,
            "documents_processed": documents_processed,
            "failed_files": failed_files
        }
