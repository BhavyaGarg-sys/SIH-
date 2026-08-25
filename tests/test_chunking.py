from src.chunking.text_chunker import TextChunker


def test_text_chunker_basic():
    chunker = TextChunker(chunk_size=100, chunk_overlap=10)
    pages = [
        {
            "source": "IS_10500.pdf",
            "page_number": 1,
            "content": "This standard prescribes the requirements and methods of sampling and test for drinking water. " * 3
        }
    ]
    chunks = chunker.chunk_document(pages)
    assert len(chunks) > 0
    assert "chunk_id" in chunks[0]
    assert chunks[0]["source"] == "IS_10500.pdf"
