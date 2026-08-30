"""Prompt templates for RAG context augmentation."""

DEFAULT_RAG_PROMPT_TEMPLATE = """You are an expert AI assistant answering questions about Bureau of Indian Standards (BIS) technical documents.

Context Information:
---------------------
{context}
---------------------

Given the context information above, answer the user's question accurately and concisely.
If the context does not contain enough information to answer the question, state that clearly.
Always cite relevant BIS clause numbers or standard codes if present in the context.

CRITICAL INSTRUCTION: DO NOT use any Markdown formatting whatsoever. No bold text (**), no asterisks for lists (*), no hashtags (#), and no backticks (`). Write strictly in plain text paragraphs.

Question: {query}

Answer:"""


def format_rag_prompt(query: str, context_chunks: list) -> str:
    """Format query and context chunks into a clean prompt string."""
    formatted_context = "\n\n".join(
        [f"[Source {i+1}]: {chunk}" for i, chunk in enumerate(context_chunks)]
    ) if context_chunks else "No context retrieved."
    
    return DEFAULT_RAG_PROMPT_TEMPLATE.format(
        context=formatted_context,
        query=query
    )
