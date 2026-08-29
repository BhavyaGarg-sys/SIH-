# Routing Strategy Comparison: LLM vs. UI-Driven

This document compares the two different ways we can route a user to their specific User Story (e.g., getting a certification checklist vs asking a technical question).

---

## Strategy A: LLM-Driven Intent Routing (The "Smart Chat" Approach)

In this strategy, the user lands on a mostly unified chat interface. They type whatever they want in natural language, and the LLM acts as the traffic cop to figure out what they mean.

### Frontend Experience
*   **UI Layout**: Dominant chat window. Maybe a few "suggestion chips" (e.g., "Ask about certification") to get them started.
*   **User Action**: The user types: *"I want to make LED bulbs in Gujarat, what do I do?"*
*   **Friction**: Very low friction. The user just talks.

### Backend Mechanics
*   **The Router**: FastAPI receives the string. It calls the LLM (LangChain + Pydantic) to extract: `intent="CERTIFICATION", product="LED bulb", location="Gujarat"`.
*   **The Execution**: Based on the LLM's JSON output, the backend queries MongoDB for LED bulb rules and returns the Dashboard UI widget.

### Pros & Cons
*   ✅ **Pros**: Feels highly magical and conversational. Handles complex, multi-part questions effortlessly. Very flexible if the user pivots the conversation.
*   ❌ **Cons**: **Non-deterministic**. If the LLM misinterprets the product or intent, the user gets the wrong dashboard. Adds latency (an extra LLM call just to figure out what to do) and API costs.

---

## Strategy B: UI-Driven Deterministic Routing (The "Guided Wizard" Approach)

In this strategy, the frontend UI forces the user down specific funnels *before* they can chat. The user's explicit clicks dictate the User Story.

### Frontend Experience
*   **UI Layout**: The home screen is a Dashboard or a Wizard, not a blank chat. It has large, explicit buttons:
    - `[ Certify a New Product ]`
    - `[ Verify a Consumer Hallmark ]`
    - `[ Ask a Technical Standard Question ]`
*   **User Action (Certify Product Flow)**:
    1. User clicks `[ Certify a New Product ]`.
    2. UI shows a form or dropdown: *"Search for your product category:"* (Powered by an autocomplete API).
    3. User selects "LED Bulbs" from the dropdown and clicks "Generate Plan".
*   **Friction**: Slightly higher initial friction (clicking through menus), but zero ambiguity.

### Backend Mechanics
*   **The Router**: There is no LLM intent router. The frontend literally hits different API endpoints based on the UI flow.
    - Frontend calls `GET /api/certification/checklist?product_id=123`.
    - Backend does a direct, deterministic MongoDB lookup and returns the JSON dashboard.
*   **The Execution**: LLMs and FAISS are *only* invoked if the user clicks `[ Ask a Technical Standard Question ]` and types a query into that specific RAG chat window.

### Pros & Cons
*   ✅ **Pros**: **100% Deterministic**. Zero chance of hallucinating the wrong certification scheme. Zero latency/cost for generating the compliance dashboards.
*   ❌ **Cons**: Can feel a bit like a traditional web portal rather than a purely "AI-powered" assistant. Users have to know how to navigate the menus.

---

## The Hybrid Recommendation (Best of Both Worlds)

You can actually combine these seamlessly:
1. Provide the **UI-Driven buttons** on the home screen for users who know exactly what they want (Deterministic, Zero LLM Cost).
2. Keep a **"Smart Search" bar** at the top. If a user prefers to type *"How do I certify LED bulbs"*, the LLM Router parses it and automatically redirects them into the deterministic UI flow. 
