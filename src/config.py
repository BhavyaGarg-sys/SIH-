import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if present
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)


class Config:
    """Central configuration class for BIS RAG system."""

    # Data & Storage Paths
    DATA_RAW_PATH: Path = BASE_DIR / os.getenv("DATA_RAW_PATH", "data/raw")
    DATA_PROCESSED_PATH: Path = BASE_DIR / os.getenv("DATA_PROCESSED_PATH", "data/processed")
    VECTORSTORE_PATH: Path = BASE_DIR / os.getenv("VECTORSTORE_PATH", "data/vectorstore")

    # Embedding Model Settings
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

    # Text Chunking Settings
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "50"))

    # Retrieval Settings
    TOP_K: int = int(os.getenv("TOP_K", "4"))

    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai").lower()
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")


config = Config()
