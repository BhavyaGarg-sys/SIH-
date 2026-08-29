# Key User Journeys

To make the product actually solve problems, we must design structured journeys rather than expecting the user to prompt the AI perfectly.

## Journey 1: The MSME "Launch my Product" Flow
**Goal**: A manufacturer wants to know how to get certified.

1. **Triage/Onboarding**: The user opens the app. Instead of a blank chat, they see clear intent buttons: *"I want to certify a product"*, *"I am a consumer checking a product"*, *"I want to find a lab"*.
2. **Product Profiling**: User selects *"Certify a product"*. The AI asks: *"What product are you manufacturing or importing? Please describe it."*
3. **Implicit Inference**: User types *"USB-C fast chargers"*. The AI infers the category (Electronics) and queries the RAG backend for applicable mandatory standards.
4. **The Reveal (Dashboard)**: The UI renders a structured card, NOT just text.
   - **Alert**: "This falls under Compulsory Registration Scheme (CRS)."
   - **Standard**: IS 13252 (Part 1).
5. **Actionable Checklist**: The AI generates a 4-step checklist.
6. **Contextual Handoff**: The AI prompts: *"To begin, you need to test this at a BIS-recognized lab. Would you like me to find labs near you?"*

## Journey 2: The Consumer Verification Flow
**Goal**: A consumer wants to know if their gold is real or if a toy is safe.

1. **Triage**: User clicks *"Consumer Help"*.
2. **Prompting**: AI asks *"What do you want to check? (e.g., Gold Hallmark, ISI mark on a helmet)"*.
3. **Guidance**: If the user says *"Gold"*, the AI doesn't just quote the hallmarking regulations. It provides a visual guide: *"Look for the 6-digit HUID code on the jewelry. Type it here or use the BIS Care App to verify it."*

## Journey 3: The Deep-Dive Chat (The RAG Fallback)
**Goal**: A user has a highly specific technical question.

1. **Entry**: User selects *"Ask a technical question about a standard"*.
2. **Interaction**: User asks *"What is the maximum allowed lead content in PVC pipes under IS 4985?"*
3. **Response**: This is where the pure conversational RAG shines. It searches the vector DB, pulls the exact clause, and answers: *"According to IS 4985, Clause 5.1.2, the lead content must not exceed..."* with a footnote citing the document.
