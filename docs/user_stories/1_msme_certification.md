# User Story: MSME Manufacturer Compliance Flow

**As an** MSME manufacturer (e.g., making LED Bulbs),
**I want** to know the exact steps and standards required to legally sell my product in India,
**So that** I don't waste weeks guessing or hiring expensive consultants.

### Acceptance Criteria & Flow:
1. **The Entry:** The user lands on the app and selects "I want to certify a product."
2. **The Prompt:** The AI asks: "What product are you manufacturing or importing? Please describe it."
3. **The Input:** User types: "I manufacture 9W LED bulbs in Gujarat."
4. **The System Action (Behind the scenes):**
    - The LLM extracts the intent (`CERTIFICATION`) and the product (`LED Bulb`).
    - The system maps "LED Bulb" to its standard (e.g., IS 16102) using either a structured search or a targeted FAISS RAG lookup.
    - The system identifies the scheme (CRS).
5. **The Output:** The user receives a **Compliance Dashboard UI widget**, not a paragraph of text.
    - **Standard Identified**: IS 16102 (Part 1).
    - **Scheme**: Compulsory Registration Scheme (CRS).
    - **Checklist**: 
        - [ ] Step 1: In-house testing setup.
        - [ ] Step 2: Test at BIS recognized lab.
        - [ ] Step 3: Apply on CRS portal.
6. **The Follow-up:** The AI prompts, "Would you like me to find a BIS-recognized lab near Gujarat for testing IS 16102?"
