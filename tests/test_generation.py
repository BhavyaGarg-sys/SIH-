from src.generation.llm_wrapper import LLMWrapper
from src.generation.prompt import format_rag_prompt


def test_llm_wrapper_stub():
    llm = LLMWrapper(provider="mock", model_name="mock-model")
    response = llm.generate("Test prompt")
    assert isinstance(response, str)
    assert "[LLM Wrapper Stub" in response


def test_format_rag_prompt():
    prompt = format_rag_prompt("What is X?", ["Context chunk 1", "Context chunk 2"])
    assert "What is X?" in prompt
    assert "[Source 1]: Context chunk 1" in prompt
    assert "[Source 2]: Context chunk 2" in prompt
