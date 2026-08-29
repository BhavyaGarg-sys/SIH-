# User Story: Consumer Hallmark Verification

**As a** Consumer,
**I want** to easily check if a product I just bought (like gold jewelry) is genuine,
**So that** I know I am not being scammed.

### Acceptance Criteria & Flow:
1. **The Entry:** The user selects "I want to verify a product."
2. **The Prompt:** The AI asks: "What are you trying to verify? (e.g., Gold jewelry, an ISI marked helmet, etc.)"
3. **The Input:** User types: "I bought a gold ring, it has some marks on it."
4. **The System Action (Behind the scenes):**
    - LLM extracts intent (`VERIFY_PRODUCT`) and product (`Gold jewelry`).
    - Instead of just dumping RAG text about hallmarking laws from FAISS, the system triggers a specific "Hallmarking Guide" UI flow.
5. **The Output:** The user sees a visual **Verification Helper UI**.
    - It shows an image/diagram of the 3 hallmark symbols (BIS logo, Purity grade, 6-digit HUID).
    - Text: "Please look for the 6-digit alphanumeric HUID code on your ring."
6. **The Follow-up:** The AI provides a direct link/button to the official BIS Care App or an integrated verification tool to check that specific HUID.
