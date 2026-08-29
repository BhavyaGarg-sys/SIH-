# Core Product Features

To deliver the vision outlined in the previous documents, the MVP must implement the following specific features on top of the base RAG pipeline.

## 1. Intent-Driven Onboarding
*   **What it is**: The home screen provides 3-4 predefined paths (Certify Product, Consumer Info, Lab Finder, Open Chat) rather than a blank input.
*   **Why it matters**: Reduces friction and anxiety. Users don't need to learn how to "prompt" the AI; they just click what they want to do.

## 2. Smart Product Profiler (LLM as a Data Extractor)
*   **What it is**: When a user describes a product, the backend LLM doesn't just generate a chat response. It extracts JSON: `{"category": "electronics", "keywords": ["charger", "adapter"], "is_mandatory_likely": true}`.
*   **Why it matters**: This structured data is used to query the RAG engine much more accurately than a raw user query, reducing hallucinations and missed standards.

## 3. Dynamic Compliance Dashboard (UI Feature)
*   **What it is**: When the RAG engine finds the standard and scheme, the React frontend renders a specialized UI component (a card or dashboard), not a Markdown chat bubble. 
*   **Why it matters**: Users need to see their compliance requirements as a project plan (with checkboxes), not as a conversational paragraph.

## 4. Geo-Aware Lab Suggestions
*   **What it is**: When the AI determines a standard requires testing, it explicitly asks for the user's State/City, queries a structured lab database (MongoDB, not the vector DB), and returns a list of local labs.
*   **Why it matters**: Transforms the platform from an "information provider" to an "action enabler". It bridges the gap between knowing what to do and actually doing it.

## 5. Structured Citations & Source Linking
*   **What it is**: Every factual claim made by the AI includes a clickable reference (e.g., `[IS 4151: Clause 4.2]`) that allows the user to see the exact text from the original PDF.
*   **Why it matters**: Builds trust. Government compliance is high-stakes; users will not trust an AI that hallucinates or cannot prove its claims.
