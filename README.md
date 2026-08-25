# BIS Document Question-Answering System (RAG)

**SIH Problem Statement 107 (PS107)**

A modular, high-performance Retrieval-Augmented Generation (RAG) question-answering system for Bureau of Indian Standards (BIS) technical standards and compliance documentation.

---

## Architecture Principle & Design

This application avoids monolithic "black box" RAG frameworks (such as opaque end-to-end chains) to ensure full transparency and control over document extraction, text cleaning, chunking, embedding generation, vector indexing, document retrieval, and prompt context formatting.

```
BIS PDFs
   ↓
PDF Extraction (PyMuPDF)
   ↓
Cleaning (DocumentProcessor)
   ↓
Chunking (TextChunker via langchain-text-splitters)
   ↓
Embedding Model (SentenceTransformers)
   ↓
FAISS Vector Store
   ↓
Retriever
   ↓
Retrieved Context
   ↓
LLM Wrapper (langchain-core provider abstraction)
   ↓
LLM Provider (OpenAI / Gemini / Ollama)
   ↓
Answer + Sources
   ↓
FastAPI Layer
   ↓
Web Frontend (Future)
```

---

## Role of the LLM Wrapper

The LLM Wrapper ([`src/generation/llm_wrapper.py`](file:///Users/lakshyachuttani/Desktop/SIH/bis-rag/src/generation/llm_wrapper.py)) decouples the core RAG logic from specific LLM providers. By wrapping model instantiation behind a unified `generate(prompt)` interface built on `langchain-core` abstractions:
- Switch between providers (OpenAI, Google Gemini, Ollama, HuggingFace) by changing `.env` variables (`LLM_PROVIDER`, `LLM_MODEL`).
- No API keys are hard-coded in project source files.
- Upstream RAG pipeline components remain untouched when changing models.

---

## Project Structure

```
bis-rag/
│
├── data/
│   ├── raw/                  # Place raw BIS PDF documents here
│   │   └── .gitkeep
│   ├── processed/            # Cleaned document JSON/text output
│   │   └── .gitkeep
│   └── vectorstore/          # Saved FAISS vector index & metadata
│       └── .gitkeep
│
├── src/
│   ├── __init__.py
│   │
│   ├── ingestion/            # PDF extraction and cleaning
│   │   ├── __init__.py
│   │   ├── pdf_loader.py
│   │   └── document_processor.py
│   │
│   ├── chunking/             # Text chunking
│   │   ├── __init__.py
│   │   └── text_chunker.py
│   │
│   ├── embeddings/           # Dense vector embedding generation
│   │   ├── __init__.py
│   │   └── embedding_model.py
│   │
│   ├── vectorstore/          # FAISS index management
│   │   ├── __init__.py
│   │   └── faiss_store.py
│   │
│   ├── retrieval/            # Context retrieval engine
│   │   ├── __init__.py
│   │   └── retriever.py
│   │
│   ├── generation/           # Prompt formatting & provider-agnostic LLM wrapper
│   │   ├── __init__.py
│   │   ├── llm_wrapper.py
│   │   └── prompt.py
│   │
│   ├── pipeline/             # RAG pipeline orchestration
│   │   ├── __init__.py
│   │   └── rag_pipeline.py
│   │
│   └── config.py             # Central configuration (.env loader)
│
├── api/                      # FastAPI Web Server
│   ├── __init__.py
│   ├── main.py               # FastAPI app definition & root healthcheck
│   ├── routes/
│   │   ├── __init__.py
│   │   └── query.py           # POST /query endpoint router placeholder
│   └── schemas/
│       ├── __init__.py
│       └── query.py           # Pydantic request & response models
│
├── frontend/                 # Future Web UI components
│   └── .gitkeep
│
├── scripts/                  # Workflow scripts
│   ├── ingest_documents.py
│   ├── build_embeddings.py
│   ├── build_vectorstore.py
│   └── test_retrieval.py
│
├── tests/                    # Pytest suite
│   ├── __init__.py
│   ├── test_chunking.py
│   ├── test_embeddings.py
│   ├── test_retrieval.py
│   └── test_generation.py
│
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
├── README.md
└── main.py                   # Root launcher for Uvicorn server
```

---

## Environment Setup & Installation

### 1. Prerequisites
- Python 3.9+ installed.

### 2. Virtual Environment Setup
Navigate to project directory and create `.venv`:
```bash
cd bis-rag
python3 -m venv .venv
```

Activate the virtual environment:
- **macOS / Linux**:
  ```bash
  source .venv/bin/activate
  ```
- **Windows**:
  ```cmd
  .venv\Scripts\activate
  ```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## Document Placement & Workflow

1. **Place Raw BIS PDFs**: Copy standard PDF files (e.g. `IS_10500_2012.pdf`) into:
   ```
   bis-rag/data/raw/
   ```
2. **Configuration**: Copy `.env.example` to `.env` and set parameters:
   ```bash
   cp .env.example .env
   ```
3. **Run Pipeline Stages (Future Pipeline Scripts)**:
   - `python scripts/ingest_documents.py`
   - `python scripts/build_embeddings.py`
   - `python scripts/build_vectorstore.py`
   - `python scripts/test_retrieval.py`

---

## How to Run FastAPI Server

Using python runner:
```bash
python main.py
```
Or directly using Uvicorn:
```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be accessible at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Sample Query Request:
```bash
curl -X POST "http://localhost:8000/query" \
     -H "Content-Type: application/json" \
     -d '{"query": "What is the acceptable limit for pH in drinking water?", "top_k": 4}'
```

---

## Testing

Run pytest suite:
```bash
pytest
```

---

## Future RAG Implementation Stages

1. **Ingestion & Parsing**: PyMuPDF extraction of tables, text, and clause headers from BIS PDF standards.
2. **Chunking**: Chunk optimization tailored to technical standard clauses.
3. **Embedding Generation**: Indexing chunks into FAISS vector store using domain-specific embedding models.
4. **Hybrid Retrieval**: Dense similarity search + BM25 keyword matching for exact standard clause codes.
5. **Generation & UI**: Connecting live LLM generation layer and building interactive Web UI frontend.
