from src.chunking.text_chunker import TextChunker


def test_text_chunker_metadata_preservation():
    chunker = TextChunker(chunk_size=150, chunk_overlap=20)
    pages = [
        {
            "document_id": "doc_IS_10500_12345678",
            "source": "IS_10500.pdf",
            "page": 2,
            "text": "Clause 4.1 Organoleptic and Physical Parameters. Drinking water shall comply with the requirements. " * 3
        }
    ]
    chunks = chunker.chunk_pages(pages)

    assert len(chunks) > 0
    for chunk in chunks:
        assert chunk["document_id"] == "doc_IS_10500_12345678"
        assert chunk["source"] == "IS_10500.pdf"
        assert chunk["page"] == 2
        assert chunk["chunk_id"].startswith("doc_IS_10500_12345678_p2_c")
        assert len(chunk["text"]) > 0
