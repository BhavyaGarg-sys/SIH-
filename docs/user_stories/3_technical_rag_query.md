# User Story: The Deep-Dive Technical Query

**As a** Researcher, Student, or Quality Control Engineer,
**I want** to ask highly specific technical questions about a BIS standard clause,
**So that** I don't have to manually CTRL+F through a 50-page PDF.

### Acceptance Criteria & Flow:
1. **The Entry:** User types a direct question into the chat without using the guided buttons: "What is the maximum allowed voltage drop for an EV charging cable under IS 17017?"
2. **The System Action (Behind the scenes):**
    - LLM extracts intent (`TECHNICAL_QUERY`).
    - The query is embedded and searched against the existing FAISS vector index containing the BIS document chunks.
    - Top-K chunks are retrieved using `langchain-core` retrievers.
    - The LLM synthesizes the answer using *only* the retrieved context.
3. **The Output:** The user receives a conversational answer.
    - Text: "According to IS 17017, the maximum allowed voltage drop is..."
    - **Crucial Feature**: The answer includes clickable citations (e.g., `[IS 17017: Clause 4.2]`). Clicking the citation expands a small window showing the exact raw text from the original PDF chunk to prove the AI isn't hallucinating.
