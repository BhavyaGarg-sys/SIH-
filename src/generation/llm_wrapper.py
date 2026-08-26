import logging
from typing import Optional
from src.config import config

logger = logging.getLogger(__name__)


class LLMWrapper:
    """Provider-agnostic LLM Wrapper interface for generation layer.
    
    Uses langchain-core abstractions or provider-specific clients dynamically,
    isolating the RAG application from specific LLM vendors.
    """

    def __init__(
        self,
        provider: Optional[str] = None,
        model_name: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        self.provider = (provider or config.LLM_PROVIDER).lower()
        self.model_name = model_name or config.LLM_MODEL
        self.api_key = api_key or config.LLM_API_KEY
        self._llm = self._initialize_llm()

    def _initialize_llm(self):
        """Instantiates the underlying LLM based on configured provider."""
        if self.provider == "openai":
            try:
                from langchain_openai import ChatOpenAI
                return ChatOpenAI(
                    model=self.model_name,
                    openai_api_key=self.api_key or None,
                    temperature=0.2,
                )
            except ImportError:
                logger.warning("langchain_openai not installed. Falling back to stub LLM.")
                return None
        elif self.provider in ("google", "google-genai", "gemini"):
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                return ChatGoogleGenerativeAI(
                    model=self.model_name,
                    google_api_key=self.api_key or None,
                    temperature=0.2,
                )
            except ImportError:
                logger.warning("langchain_google_genai not installed. Falling back to stub LLM.")
                return None
        elif self.provider == "ollama":
            try:
                from langchain_community.chat_models import ChatOllama
                return ChatOllama(model=self.model_name)
            except ImportError:
                logger.warning("ChatOllama not available. Falling back to stub LLM.")
                return None
        else:
            logger.info(f"Using generic/custom provider mode for provider '{self.provider}'.")
            return None

    def generate(self, prompt: str) -> str:
        """Generate response string for a given prompt string.
        
        Args:
            prompt: The input prompt string containing user query and retrieved context.
            
        Returns:
            str: Generated text answer.
        """
        if self._llm is not None:
            try:
                response = self._llm.invoke(prompt)
                if hasattr(response, "content"):
                    content = response.content
                    if isinstance(content, list):
                        # Extract text from block list and join
                        texts = []
                        for block in content:
                            if isinstance(block, dict) and 'text' in block:
                                texts.append(block['text'])
                            elif isinstance(block, str):
                                texts.append(block)
                        return "\n".join(texts)
                    return str(content)
                return str(response)
            except Exception as e:
                logger.error(f"Error invoking LLM provider '{self.provider}': {e}")
                return f"[LLM Provider Error]: {e}"

        # Placeholder fallback for initial setup without active API key
        return (
            f"[LLM Wrapper Stub ({self.provider}:{self.model_name})]: "
            f"Received prompt ({len(prompt)} characters). "
            f"Configure valid LLM_API_KEY in .env to enable live generation."
        )
