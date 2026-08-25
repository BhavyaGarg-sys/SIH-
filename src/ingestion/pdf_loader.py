import fitz  # PyMuPDF
from pathlib import Path
from typing import List, Dict, Any


class PDFLoader:
    """Explicit PyMuPDF loader for BIS PDF documents."""

    def __init__(self, pdf_path: str):
        self.pdf_path = Path(pdf_path)

    def load_pdf(self) -> List[Dict[str, Any]]:
        """Extract text page by page from PDF.
        
        Returns:
            List[Dict]: List of page dictionaries with page content and metadata.
        """
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {self.pdf_path}")

        pages = []
        doc = fitz.open(self.pdf_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            pages.append({
                "source": self.pdf_path.name,
                "page_number": page_num + 1,
                "content": text
            })
        doc.close()
        return pages
