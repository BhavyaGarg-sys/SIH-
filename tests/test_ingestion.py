import fitz
from pathlib import Path
from src.ingestion.pdf_loader import PDFLoader
from src.ingestion.document_processor import DocumentProcessor


def test_pdf_loader_and_corrupted_handling(tmp_path):
    # 1. Create a valid PDF
    pdf_path = tmp_path / "test_valid.pdf"
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "IS 10500 clause 4.1 Turbidity max 1.0 NTU.")
    doc.save(pdf_path)
    doc.close()

    # 2. Create a corrupted file
    corrupt_path = tmp_path / "test_corrupt.pdf"
    with open(corrupt_path, "wb") as f:
        f.write(b"NOT A VALID PDF FILE CONTENT")

    loader = PDFLoader(raw_dir=tmp_path)
    result = loader.load_all_pdfs()

    assert result["documents_processed"] == 1
    assert "test_corrupt.pdf" in result["failed_files"]
    assert len(result["all_pages"]) == 1
    assert result["all_pages"][0]["source"] == "test_valid.pdf"
    assert result["all_pages"][0]["page"] == 1


def test_document_processor_technical_preservation():
    processor = DocumentProcessor()
    raw_text = "IS 10500 : 2012 \n\n Clause 4.2  \xa0 Turbidity \t shall not exceed 1.0 NTU.  pH: 6.5 to 8.5.\x00"
    cleaned = processor.clean_text(raw_text)

    # Verify numbers, units, clauses, and symbols are intact
    assert "IS 10500 : 2012" in cleaned
    assert "Clause 4.2" in cleaned
    assert "1.0 NTU" in cleaned
    assert "6.5 to 8.5" in cleaned
    assert "\x00" not in cleaned
    assert "\xa0" not in cleaned
