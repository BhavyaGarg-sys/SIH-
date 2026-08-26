#!/usr/bin/env python3
"""Script 1: Document Ingestion, Cleaning & Chunking Pipeline.

Discovers all PDFs in data/raw/, extracts text page by page, cleans artifacts,
chunks text preserving metadata, and saves output to data/processed/chunks.json.
"""
import sys
import json
import logging
from pathlib import Path

# Add project root directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.ingestion.pdf_loader import PDFLoader
from src.ingestion.document_processor import DocumentProcessor
from src.chunking.text_chunker import TextChunker

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def main():
    print("=" * 60)
    print("STAGE 1: DOCUMENT INGESTION, CLEANING & CHUNKING")
    print("=" * 60)

    raw_dir = config.DATA_RAW_PATH
    processed_dir = config.DATA_PROCESSED_PATH
    processed_dir.mkdir(parents=True, exist_ok=True)

    print(f"Scanning directory: {raw_dir.resolve()}")
    loader = PDFLoader(raw_dir)
    result = loader.load_all_pdfs()

    all_pages = result["all_pages"]
    docs_processed = result["documents_processed"]
    failed_files = result["failed_files"]

    if not all_pages:
        print(f"\n[Warning]: No valid PDF pages extracted from {raw_dir}. Please place BIS PDF documents in data/raw/.")
        return

    print(f"Extraction Complete: {docs_processed} PDFs processed ({len(all_pages)} total pages).")
    if failed_files:
        print(f"Failed Files ({len(failed_files)}): {', '.join(failed_files)}")

    print("\nCleaning extracted page texts...")
    processor = DocumentProcessor()
    cleaned_pages = processor.process_pages(all_pages)

    print(f"\nChunking documents (size={config.CHUNK_SIZE}, overlap={config.CHUNK_OVERLAP})...")
    chunker = TextChunker()
    chunks = chunker.chunk_pages(cleaned_pages)

    chunks_file = processed_dir / "chunks.json"
    manifest_file = processed_dir / "manifest.json"

    with open(chunks_file, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

    manifest = {
        "documents_processed": docs_processed,
        "total_pages": len(all_pages),
        "total_chunks": len(chunks),
        "chunk_size": config.CHUNK_SIZE,
        "chunk_overlap": config.CHUNK_OVERLAP
    }
    with open(manifest_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print("\n" + "=" * 60)
    print("STAGE 1 COMPLETED SUCCESSFULLY")
    print(f" - Documents Processed : {docs_processed}")
    print(f" - Pages Extracted     : {len(all_pages)}")
    print(f" - Chunks Generated    : {len(chunks)}")
    print(f" - Saved Output To     : {chunks_file.resolve()}")
    print("=" * 60)


if __name__ == "__main__":
    main()
