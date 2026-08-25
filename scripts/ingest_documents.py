#!/usr/bin/env python3
"""Script stub for document ingestion and text cleaning."""
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.ingestion.pdf_loader import PDFLoader
from src.ingestion.document_processor import DocumentProcessor


def main():
    print(f"[Ingest Documents]: Scanning raw PDF directory: {config.DATA_RAW_PATH}")
    pdf_files = list(config.DATA_RAW_PATH.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDF files found in {config.DATA_RAW_PATH}. Place BIS PDFs there.")
        return

    processor = DocumentProcessor()
    for pdf_path in pdf_files:
        print(f"Loading {pdf_path.name}...")
        loader = PDFLoader(str(pdf_path))
        raw_pages = loader.load_pdf()
        processed_pages = processor.process_pages(raw_pages)
        print(f"Extracted and processed {len(processed_pages)} pages from {pdf_path.name}.")


if __name__ == "__main__":
    main()
