import os

import pytest
from fastapi import HTTPException


os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough-for-validation")
from api.routes import documents


def test_document_path_accepts_pdf_in_configured_directory(tmp_path, monkeypatch):
    document = tmp_path / "IS_10500.pdf"
    document.write_bytes(b"%PDF-test")
    monkeypatch.setattr(documents, "RAW_DOCUMENTS_DIR", tmp_path)

    assert documents.get_document_path("IS_10500.pdf") == document


@pytest.mark.parametrize("filename", ["../secret.pdf", "nested/IS_10500.pdf", "IS_10500.txt"])
def test_document_path_rejects_traversal_and_non_pdfs(tmp_path, monkeypatch, filename):
    monkeypatch.setattr(documents, "RAW_DOCUMENTS_DIR", tmp_path)

    with pytest.raises(HTTPException) as exc_info:
        documents.get_document_path(filename)

    assert exc_info.value.status_code == 400
