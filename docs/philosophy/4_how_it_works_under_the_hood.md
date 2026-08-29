# How It Works (The Mechanics)

This document explains how the product features are actually powered by the RAG backend without exposing the complexity to the user.

## 1. Hybrid Architecture: LLM Router
The system uses the LLM primarily as a router and structured data extractor, rather than just a chat generator.
*   **User Input**: "I want to sell motorcycle helmets in Delhi."
*   **Step 1 (LLM Router)**: The LLM analyzes the input and outputs a hidden JSON intent:
    ```json
    {
      "intent": "product_certification",
      "product": "motorcycle helmets",
      "location": "Delhi"
    }
    ```

## 2. Targeted RAG Retrieval
Because we extracted structured intent, we can query our vector DB highly effectively.
*   We query the `standards_vector_db` for "motorcycle helmets".
*   It returns `IS 4151`.
*   We query the `schemes_db` to see if IS 4151 is under mandatory certification (Yes, ISI Mark).

## 3. UI Generation (Not just text generation)
Instead of having the LLM stream a long paragraph explaining the ISI mark for helmets, the backend constructs a rich JSON payload:
```json
{
  "ui_type": "compliance_dashboard",
  "data": {
    "standard": "IS 4151",
    "scheme": "ISI Mark",
    "mandatory": true,
    "checklist": ["Test at Lab", "Apply on Portal", "Factory Audit"]
  },
  "conversational_text": "Here is the compliance roadmap for your motorcycle helmets. Because they fall under mandatory certification, you must obtain an ISI mark."
}
```
The React frontend reads `ui_type: compliance_dashboard` and renders a beautiful dashboard widget. It prints the `conversational_text` in the chat bubble above it.

## 4. The Action Handoff
Since the backend knows the user is in Delhi (from the LLM router extraction) and needs lab testing (from the checklist), it proactively queries the `labs_db` for Delhi labs testing IS 4151.
*   The frontend renders a "Recommended Labs" carousel right below the checklist.

## Summary
The product feels magical because it uses the LLM to structure the user's messy input, queries multiple discrete databases (Vector DB for standards text, NoSQL for labs/schemes), and returns rich UI components, wrapping it all in a friendly conversational wrapper.
