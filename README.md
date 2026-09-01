# BIS Document Question-Answering System (Agentic RAG)

**SIH Problem Statement 107 (PS107)**

A modular, high-performance **Agentic Retrieval-Augmented Generation (RAG) system** for Bureau of Indian Standards (BIS) technical standards, compliance documentation, and certification workflows. 

Designed specifically to help MSMEs navigate dense legal standards without requiring expensive compliance consultants.

---

## 🚀 Key Features

- **Agentic Intent Routing (LangGraph)**: The AI automatically categorizes user queries to generate standard RAG answers, side-by-side amendment comparisons, formal PDF reports, or step-by-step compliance dashboards based on intent.
- **Self-Correcting RAG**: If the initial vector search retrieves irrelevant context, the LangGraph agent autonomously rewrites the query and tries again before passing it to the final LLM.
- **Interactive UI Workspaces (React + Vite)**: A dedicated workspace for each product standard containing:
  - Guided step-by-step Compliance Roadmaps
  - Continuous chat threads with AI citations
  - Automatic PDF generation of chat reports
- **Semantic Caching (Redis + FAISS)**: Exact-match semantic caching (Redis) prevents duplicate LLM calls, saving API costs and drastically reducing latency for common queries.
- **User Personas & Dashboards**: Dedicated UI dashboards tracking recent projects, bookmarked standard clauses, and generated reports for quick reference.

---

## 🏗️ Architecture Stack

**Frontend**: React (Vite), Tailwind CSS, Lucide Icons, html2pdf.js  
**Backend**: FastAPI, Python 3.9+  
**Agentic AI Flow**: LangGraph, LangChain Core  
**Database**: MongoDB (via Motor for async NoSQL storage)  
**Caching**: Redis  
**Vector Database**: FAISS (SentenceTransformers embeddings)  
**LLM Providers**: Google Gemini (Fallback support for OpenAI / Ollama via abstracted llm_wrapper.py)

---

## 💻 Environment Setup & Installation

### 1. Prerequisites
- Python 3.9+ installed.
- Node.js installed.
- Docker & Docker Compose (for MongoDB and Redis).

### 2. Start the Backend Infrastructure
Spin up MongoDB and Redis using Docker Compose:
`ash
docker compose up -d
`

### 3. Start the FastAPI Backend
`ash
python3 -m venv .venv
# Activate venv: source .venv/bin/activate or .venv\Scripts\activate on Windows
pip install -r requirements.txt

# Create your .env file from the example
cp .env.example .env
# Important: Ensure GEMINI_API_KEY and MONGO_URI are set in .env

# Start the server (runs on port 8000)
uvicorn api.main:app --port 8000
`

### 4. Start the React Frontend
Open a new terminal window:
`ash
cd frontend
npm install
npm run dev
`
The application will be accessible at **http://localhost:3000**

*(Alternatively, use the provided start_demo.bat on Windows to launch everything simultaneously!)*

---

## 📂 Project Structure Highlights

- AGENTICragPIPE.py: The core LangGraph state machine driving Intent Classification, Self-Correction, and Retrieval evaluation.
- pi/routes/: FastAPI endpoints for Chat, Projects, Dashboard, and Auth.
- pi/services/rag_service.py: Context formatting, Semantic Caching, and Fallback LLM handling.
- rontend/src/pages/ProjectWorkspace.jsx: The primary interactive workspace UI for chatting and tracking compliance.
- data/vectorstore/: The persisted FAISS index containing pre-processed BIS PDF text chunks.

---

## 🧪 Quick Demo Script

If you are evaluating this project, try pasting this exact text into a new Workspace Chat for a flawless demonstration of the RAG pipeline handling complex engineering facts:

> **"I'm starting a factory to build unfired pressure vessels. Under what specific conditions can a pneumatic pressure test be carried out instead of the standard hydraulic test?"** 

*(The Agent will intelligently scan IS 2825 and accurately extract the strict safety clauses preventing water testing!)*
