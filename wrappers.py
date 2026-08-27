import asyncio
import os
from typing import AsyncGenerator, List, Optional, Type, TypeVar
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_random_exponential,
)

T = TypeVar("T", bound=BaseModel)

# =====================================================================
# The Unified Gemini LLM Wrapper Class
# =====================================================================


class GeminiWrapper:

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-2.5-flash",
        embedding_model: str = "text-embedding-004",
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_retries: int = 3,
    ):
        """Initializes the wrapper using the official google-genai SDK."""
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API key missing! Set the GEMINI_API_KEY environment variable or pass api_key parameter."
            )

        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name
        self.embedding_model = embedding_model
        self.system_instruction = system_instruction
        self.temperature = temperature
        self.max_retries = max_retries
        self.history: List[types.Content] = []

    def _get_config(
        self, response_schema: Optional[Type[BaseModel]] = None
    ) -> types.GenerateContentConfig:
        """Helper to set request generation configs."""
        config_args = {
            "temperature": self.temperature,
            "system_instruction": self.system_instruction,
        }
        if response_schema:
            config_args["response_mime_type"] = "application/json"
            config_args["response_schema"] = response_schema

        return types.GenerateContentConfig(**config_args)

    async def _execute_with_retry(self, func, *args, **kwargs):
        """Executes API requests with exponential backoff retries."""

        @retry(
            reraise=True,
            stop=stop_after_attempt(self.max_retries),
            wait=wait_random_exponential(min=1, max=10),
            retry=retry_if_exception_type(Exception),
        )
        async def call():
            return await func(*args, **kwargs)

        return await call()

    async def chat(self, user_prompt: str, save_history: bool = True) -> str:
        """Sends a text message with memory context."""
        user_content = types.Content(
            role="user", parts=[types.Part.from_text(text=user_prompt)]
        )
        contents = self.history + [user_content]

        response = await self._execute_with_retry(
            self.client.aio.models.generate_content,
            model=self.model_name,
            contents=contents,
            config=self._get_config(),
        )

        response_text = response.text or ""

        if save_history:
            self.history.append(user_content)
            model_content = types.Content(
                role="model", parts=[types.Part.from_text(text=response_text)]
            )
            self.history.append(model_content)

        return response_text

    async def chat_stream(
        self, user_prompt: str, save_history: bool = True
    ) -> AsyncGenerator[str, None]:
        """Streams text token chunks in real time while tracking history."""
        user_content = types.Content(
            role="user", parts=[types.Part.from_text(text=user_prompt)]
        )
        contents = self.history + [user_content]

        # Fetch the response stream
        response_stream = await self._execute_with_retry(
            self.client.aio.models.generate_content_stream,
            model=self.model_name,
            contents=contents,
            config=self._get_config(),
        )

        collected_chunks = []
        async for chunk in response_stream:
            if chunk.text:
                collected_chunks.append(chunk.text)
                yield chunk.text

        if save_history:
            full_text = "".join(collected_chunks)
            self.history.append(user_content)
            self.history.append(
                types.Content(
                    role="model", parts=[types.Part.from_text(text=full_text)]
                )
            )

    async def generate_structured(self, prompt: str, schema: Type[T]) -> T:
        """Generates output strictly conforming to a Pydantic schema."""
        user_content = types.Content(
            role="user", parts=[types.Part.from_text(text=prompt)]
        )

        response = await self._execute_with_retry(
            self.client.aio.models.generate_content,
            model=self.model_name,
            contents=[user_content],
            config=self._get_config(response_schema=schema),
        )

        return schema.model_validate_json(response.text)

    async def generate_embedding(self, text: str) -> List[float]:
        """Generates text embedding vector using Gemini API."""
        response = await self._execute_with_retry(
            self.client.aio.models.embed_content,
            model=self.embedding_model,
            contents=text,
        )
        # FIX: Access the first element of response.embeddings list
        return response.embeddings[0].values

    def clear_history(self) -> None:
        """Clears memory state."""
        self.history = []


# =====================================================================
# Execution Demo
# =====================================================================

class SystemArchitecture(BaseModel):
    pattern_name: str = Field(description="Name of the architectural pattern")
    best_for: List[str] = Field(description="Ideal use-case scenarios")
    complexity_rating: int = Field(description="Score from 1 to 10")


async def main():
    # 1. Instantiate wrapper
    llm = GeminiWrapper(
        model_name="gemini-2.5-flash",
        system_instruction="You are a principal software engineer.",
    )

    # 2. Text completion with history tracking
    print("--- 1. Simple Chat ---")
    reply = await llm.chat(
        "I need to design a system that processes 1 million events per second."
    )
    print(f"Response:\n{reply}\n")

    # 3. Streaming response using existing history context
    print("--- 2. Streaming Response ---")
    print("Streamed Output: ", end="")
    async for chunk in llm.chat_stream("What messaging broker should I use?"):
        print(chunk, end="", flush=True)
    print("\n\n")

    # 4. Enforce Pydantic structured output
    print("--- 3. Structured Data Extraction ---")
    arch_data = await llm.generate_structured(
        "Extract details for the Event Sourcing pattern.", SystemArchitecture
    )
    print(f"Pattern Name: {arch_data.pattern_name}")
    print(f"Complexity: {arch_data.complexity_rating}/10")
    print(f"Best Use Cases: {', '.join(arch_data.best_for)}")

    # 5. Text Embedding Generation
    print("\n--- 4. Generating Embedding ---")
    vector = await llm.generate_embedding("Bureau of Indian Standards IS 14543")
    print(f"Generated Vector Dimension: {len(vector)}")


if __name__ == "__main__":
    asyncio.run(main())