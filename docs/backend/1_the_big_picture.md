# The Big Picture: Dual-Mode Backend Architecture

To provide maximum flexibility while ensuring compliance safety, our backend acts as an **intelligent traffic cop** that supports two distinct interaction modes: **Guided UI** and **Structured RAG**.

## The Tech Stack
*   **FastAPI**: The main server.
*   **MongoDB**: Stores chat histories, lab locations, and static compliance checklists.
*   **FAISS**: The vector database containing chunked text of BIS PDFs.
*   **LangChain**: Formats prompts and extracts structured intents.

## The Dual-Mode Flow

When the user sends a message, the backend processes it in 3 steps:

### Step 1: Understand (The Router)
The backend asks the LLM: *"What is the user trying to do?"* (e.g., Certify a product, Verify a hallmark, Ask a technical question).
It extracts structured data like `product="LED Bulb"`.

### Step 2: Check User Preference (The Mode)
The frontend passes an `interaction_mode` parameter (defaults to `guided_ui`).
- **If `guided_ui`**: The backend stops the AI from generating paragraphs of text. It fetches the compliance rules from MongoDB and prepares a deterministic UI Widget (like a checklist or a multiple-choice prompt).
- **If `structured_rag`**: The backend fetches *both* the MongoDB rules and FAISS technical chunks, injects them securely into a prompt, and asks the LLM to generate a comprehensive, conversational text response.

### Step 3: Respond to Frontend
The API returns a JSON payload containing either the structured `ui_widget` data or the conversational `ai_text` with citations.
