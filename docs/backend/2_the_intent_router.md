# The Intent Router: Handling Dual Modes

The Router is responsible for intercepting the user's natural language and deciding how to fulfill the request based on their chosen `interaction_mode`.

## The Routing Logic

Using LangChain and Pydantic (`structured_llm`), we extract the `intent` (e.g., `CERTIFICATION`) and `product` (e.g., `LED Bulb`). 

Here is how the backend Python logic branches:

```python
def route_query(user_message: str, interaction_mode: str = "guided_ui"):
    # 1. Extract Intent
    extracted_data = structured_llm.invoke(user_message)
    
    if extracted_data.intent == "CERTIFICATION":
        
        # Branch A: Guided UI (Default)
        if interaction_mode == "guided_ui":
            # Check if product is ambiguous
            matches = search_mongodb_products(extracted_data.product)
            if len(matches) > 1:
                return generate_ui_checkpoint(matches) # Asks user to click which product they meant
            else:
                return generate_ui_dashboard(matches[0]) # Returns the checklist widget
                
        # Branch B: Structured RAG
        elif interaction_mode == "structured_rag":
            # Fetch structured rules + FAISS chunks
            rules = search_mongodb_products(extracted_data.product)
            chunks = search_faiss(user_message)
            # LLM generates conversational text using both sources
            return generate_enriched_llm_response(rules, chunks)
            
    elif extracted_data.intent == "TECHNICAL_QUERY":
        # Technical queries always use FAISS RAG, regardless of mode
        return run_faiss_rag(user_message)
```

By cleanly splitting the logic based on `interaction_mode`, the backend remains incredibly robust. It prevents hallucinations in `guided_ui` mode while offering a highly authentic AI experience in `structured_rag` mode.
