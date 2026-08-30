from src.pipeline.rag_pipeline import RAGPipeline


class FakeRetriever:
    def retrieve(self, query, top_k):
        return [
            {
                "text": "Clause 4.2 permits the specified limit.",
                "source": "IS_10500.pdf",
                "page": 7,
                "chunk_id": "chunk-7",
                "score": 0.91,
            }
        ]


class FakeLLM:
    def __init__(self):
        self.prompt = None

    def generate(self, prompt):
        self.prompt = prompt
        return "Answer"


def test_pipeline_uses_retriever_text_and_page_fields():
    llm = FakeLLM()
    pipeline = RAGPipeline(retriever=FakeRetriever(), llm=llm)

    result = pipeline.run("What is the limit?", top_k=1)

    assert "Clause 4.2 permits the specified limit." in llm.prompt
    assert result["sources"] == [
        {"source": "IS_10500.pdf", "page": 7, "chunk_id": "chunk-7", "score": 0.91}
    ]
