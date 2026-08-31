import os
import time
import asyncio
from typing import Tuple, List, Optional, TypedDict
from pydantic import BaseModel
from langgraph.graph import StateGraph, END
from src.retrieval.retriever import Retriever

# Reuse the same implementations as rag_service.py
_retriever = Retriever()
from src.generation.llm_wrapper import LLMWrapper
_llm = LLMWrapper()

# Mocking existing schemas
class Citation(BaseModel):
    standard: str
    clause: str
    
class UIWidget(BaseModel):
    type: str
    data: dict

# ------------------------------------------------------------------
# 1. STATE DEFINITION (The Agent's "Memory" during a run)
# ------------------------------------------------------------------
class GraphState(TypedDict):
    user_query: str
    decision: str
    search_query: str
    documents: list
    is_relevant: bool
    revision_count: int
    ai_text: str
    citations: list
    ui_widget: dict

# ------------------------------------------------------------------
# 2. NODES (The Agent's "Brain" and "Actions")
# ------------------------------------------------------------------
def node_route(state: GraphState) -> GraphState:
    print("[Agent] Categorizing user intent...")
    query = state["user_query"].lower()
    
    if "compare" in query: decision = "compare"
    elif "report" in query: decision = "report"
    elif "hello" in query: decision = "general"
    else: decision = "search"
    
    return {"decision": decision}

def node_rewrite(state: GraphState) -> GraphState:
    revision = state.get("revision_count", 0) + 1
    user_q = state["user_query"]
    print(f"[Agent] Rewriting search query (Attempt {revision}/2)...")

    # Build a genuinely different search query per attempt.
    # Never invent BIS standard numbers, clause numbers, limits, or facts.
    BIS_SYNONYMS = {
        "water": "drinking water potable water quality",
        "ph": "pH acidity alkalinity hydrogen-ion",
        "limit": "acceptable limit tolerance permissible value requirement",
        "concrete": "concrete cement reinforcement structural",
        "steel": "steel iron alloy tensile strength",
    }

    extra_terms = []
    for keyword, synonyms in BIS_SYNONYMS.items():
        if keyword in user_q.lower():
            extra_terms.append(synonyms)

    if revision == 1:
        new_query = user_q
        if extra_terms:
            new_query = f"{user_q} {' '.join(extra_terms)}"
    else:
        # Second attempt: rephrase more aggressively
        new_query = f"Indian Standard specification for {user_q}"
        if extra_terms:
            new_query += f" {' '.join(extra_terms)}"

    print(f"[Agent] Rewritten query: '{new_query}'")
    return {"search_query": new_query, "revision_count": revision}

def node_retrieve(state: GraphState) -> GraphState:
    query = state["search_query"]
    print(f"[Agent] Searching database for: '{query}'")

    try:
        results = _retriever.retrieve(query, top_k=4)
    except Exception as e:
        print(f"[Agent] Retrieval error: {e}")
        results = []

    print(f"[Agent] Retrieved {len(results)} document(s)")
    return {"documents": results}

def node_evaluate(state: GraphState) -> GraphState:
    MAX_RETRIES = 2
    revision = state.get("revision_count", 0)
    documents = state.get("documents", [])

    print(
        f"[Agent] Evaluating retrieved context "
        f"(attempt {revision}/{MAX_RETRIES})..."
    )

    if not documents:
        print("[Agent] No documents retrieved.")
        return {"is_relevant": False}

    context_text = "\n\n".join([f"Document {i+1}:\n{doc.get('text', '')}" for i, doc in enumerate(documents)])
    prompt = f"""You are a strict relevance evaluator.
User query: '{state['user_query']}'
Retrieved Context:
{context_text}

Does the retrieved context contain information relevant to answering the user query?
Answer with exactly "YES" or "NO".
"""
    
    try:
        response = _llm.generate(prompt).strip().upper()
        is_relevant = "YES" in response
        print(f"[Agent] LLM Evaluation Response: {response}")
    except Exception as e:
        print(f"[Agent] LLM Evaluation failed: {e}. Defaulting to True to prevent crash.")
        is_relevant = True

    print(f"[Agent] Relevant: {is_relevant}")

    return {
        "is_relevant": is_relevant
    }


def route_after_eval(state: GraphState):
    MAX_RETRIES = 2

    if state.get("is_relevant", False):
        return "generate"

    if state.get("revision_count", 0) >= MAX_RETRIES:
        print(
            f"[Agent] Retry limit ({MAX_RETRIES}) reached. "
            "Using best available context."
        )
        return "generate"

    return "rewrite"

def node_generate_rag(state: GraphState) -> GraphState:
    print("[Agent] Synthesizing final answer from context.")
    docs = state.get("documents", [])

    # Safe fallback if no documents were retrieved after all retries
    if not docs:
        print("[Agent] No documents available. Returning safe fallback.")
        return {
            "ai_text": "I could not find relevant information in the BIS standards database for your query. Please try rephrasing your question or check that the relevant standards have been ingested.",
            "citations": []
        }

    # Build citations from actual retrieval metadata.
    # Never fabricate clause numbers or standard names.
    cits = []
    for doc in docs:
        std = doc.get("standard") or doc.get("source", "Unknown Document")
        clause = doc.get("clause", "")
        if not clause:
            # If no real clause metadata, leave it as a generic label
            clause = "See document for details"
        cits.append(Citation(standard=std, clause=clause))

    context_text = "\n\n".join([f"Document {i+1} (Source: {doc.get('source', 'Unknown')}):\n{doc.get('text', '')}" for i, doc in enumerate(docs)])
    prompt = f"""You are an expert BIS (Bureau of Indian Standards) assistant. Answer the user query using ONLY the provided context. 
If the answer is not contained in the context, say so gracefully. Do not invent information.

User query: '{state['user_query']}'

Context:
{context_text}
"""
    try:
        ai_text = _llm.generate(prompt)
    except Exception as e:
        print(f"[Agent] LLM Generation failed: {e}")
        ai_text = "Sorry, I encountered an error while generating the response."

    return {
        "ai_text": ai_text,
        "citations": cits
    }

def node_compare(state: GraphState) -> GraphState:
    print("[Agent] Executing Amendment Comparison Tool")
    return {
        "ai_text": "I've generated a side-by-side comparison.",
        "ui_widget": UIWidget(type="COMPARISON_LINK", data={"id": "123"})
    }

def node_report(state: GraphState) -> GraphState:
    print("[Agent] Executing Formal Report Tool")
    return {
        "ai_text": "Your formal PDF report is ready.",
        "ui_widget": UIWidget(type="REPORT_LINK", data={"id": "456"})
    }

def node_general(state: GraphState) -> GraphState:
    print("[Agent] Answering generally (DB skipped)")
    return {"ai_text": "Hello! I am the BIS AI Assistant."}

# ------------------------------------------------------------------
# 3. CONDITIONAL ROUTING LOGIC
# ------------------------------------------------------------------
def route_after_decision(state: GraphState):
    return state["decision"]

# ------------------------------------------------------------------

# ------------------------------------------------------------------
# 4. BUILDING THE GRAPH (Wiring it all together)
# ------------------------------------------------------------------
builder = StateGraph(GraphState)

# Add all nodes
builder.add_node("route", node_route)
builder.add_node("rewrite", node_rewrite)
builder.add_node("retrieve", node_retrieve)
builder.add_node("evaluate", node_evaluate)

# Define the flow
builder.set_entry_point("route")

def route_after_decision(state: GraphState):
    decision = state["decision"]
    if decision == "search":
        return "rewrite"
    return "end"

# The router decides which sub-graph to execute
builder.add_conditional_edges(
    "route", route_after_decision,
    {
        "rewrite": "rewrite",
        "end": END
    }
)

# The RAG loop
builder.add_edge("rewrite", "retrieve")
builder.add_edge("retrieve", "evaluate")

def route_after_eval(state: GraphState):
    MAX_RETRIES = 2
    if state.get("is_relevant", False):
        return "end"
    if state.get("revision_count", 0) >= MAX_RETRIES:
        return "end"
    return "rewrite"

# The self-correction edge!
builder.add_conditional_edges(
    "evaluate", route_after_eval,
    {
        "end": END,
        "rewrite": "rewrite"  # Loops back to rewrite query!
    }
)

# Compile the agent!
app = builder.compile()


# ------------------------------------------------------------------
# 5. WRAPPER CLASS (For API Drop-in Replacement)
# ------------------------------------------------------------------
class AgenticRAGPipeline:
    async def run(self, user_message: str) -> dict:
        print(f"\n{'='*60}")
        print(f"AGENTIC RAG PIPELINE: {user_message}")
        print(f"{'-'*60}")
        
        initial_state = {
            "user_query": user_message,
            "decision": "",
            "search_query": user_message,
            "documents": [],
            "is_relevant": False,
            "revision_count": 0,
            "ai_text": "",
            "citations": [],
            "ui_widget": None,
        }
        final_state = await app.ainvoke(initial_state)
        return final_state
