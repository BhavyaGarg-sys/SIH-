# The API Payload (Unified Dual-Mode Response)

To support both modes without requiring the frontend to call completely different API paths, we use a single, unified endpoint: `POST /api/v1/chat`.

## The Request
The frontend sends the user's message and their chosen mode (defaulting to `guided_ui`).
```json
{
  "session_id": "sess_12345",
  "message": "I make steel pipes, how do I certify them?",
  "interaction_mode": "guided_ui" 
}
```

## Response A: Guided UI Checkpoint (Disambiguation)
If the backend finds multiple standards for "steel pipes" and is in `guided_ui` mode, it asks the user to pick one.
```json
{
  "ai_text": "I found a few matching product categories. Please select the one that applies to you:",
  "ui_widget": {
     "type": "CHECKPOINT_SELECTION",
     "options": [
        {"id": "IS_1239", "label": "Steel Tubes for Water and Sewage"},
        {"id": "IS_3589", "label": "Steel Pipes for Water and Sewage (Large Diameter)"}
     ]
  },
  "citations": []
}
```
*Frontend Action:* The user clicks an option. The frontend sends the next message: `{"message": "I select IS 1239", "interaction_mode": "guided_ui"}`.

## Response B: Guided UI Dashboard
Once the standard is confirmed, the backend returns the dashboard.
```json
{
  "ai_text": "Here is your certification roadmap for IS 1239.",
  "ui_widget": {
     "type": "COMPLIANCE_DASHBOARD",
     "data": {
        "standard": "IS 1239",
        "scheme": "ISI Mark",
        "checklist": ["In-house testing", "Apply online", "Factory Audit"]
     }
  },
  "citations": []
}
```

## Response C: Structured RAG Mode
If the user had requested `"interaction_mode": "structured_rag"`, the response looks entirely different. No UI widgets, just enriched text.
```json
{
  "ai_text": "To certify steel pipes, you must obtain an ISI mark under IS 1239. The first step is to establish an in-house testing facility. \n\n*Technical Note:* According to IS 1239 Clause 5.1, the nominal bore size must be strictly adhered to during testing.",
  "ui_widget": null,
  "citations": [
    {"standard": "IS 1239", "clause": "5.1"}
  ]
}
```

By standardizing this payload, the React frontend simply checks if `ui_widget` is null. If it is, it renders a chat bubble. If it isn't, it renders the corresponding UI component.
