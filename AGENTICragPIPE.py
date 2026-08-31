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
# 4. BUILDING THE GRAPH (Wiring it all together)
# ------------------------------------------------------------------
builder = StateGraph(GraphState)

# Add all nodes
builder.add_node("route", node_route)
builder.add_node("rewrite", node_rewrite)
builder.add_node("retrieve", node_retrieve)
builder.add_node("evaluate", node_evaluate)
builder.add_node("generate", node_generate_rag)
builder.add_node("compare", node_compare)
builder.add_node("report", node_report)
builder.add_node("general", node_general)

# Define the flow
builder.set_entry_point("route")

# The router decides which sub-graph to execute
builder.add_conditional_edges(
    "route", route_after_decision,
    {
        "search": "rewrite",
        "compare": "compare",
        "report": "report",
        "general": "general"
    }
)

# The RAG loop
builder.add_edge("rewrite", "retrieve")
builder.add_edge("retrieve", "evaluate")

# The self-correction edge!
builder.add_conditional_edges(
    "evaluate", route_after_eval,
    {
        "generate": "generate",
        "rewrite": "rewrite"  # Loops back to rewrite query!
    }
)

# All paths lead to END
builder.add_edge("generate", END)
builder.add_edge("compare", END)
builder.add_edge("report", END)
builder.add_edge("general", END)

# Compile the agent!
app = builder.compile()


# ------------------------------------------------------------------
# 5. WRAPPER CLASS (For API Drop-in Replacement)
# ------------------------------------------------------------------
class AgenticRAGPipeline:
    async def run(self, user_message: str, user_profile: dict = None) -> Tuple[str, List[Citation], Optional[UIWidget]]:
        print(f"\n{'='*60}")
        print(f"USER: {user_message}")
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
        
        ai_text = final_state.get("ai_text", "")
        citations = final_state.get("citations", [])
        ui_widget = final_state.get("ui_widget", None)
        
        print(f"{'-'*60}")
        print(f"RESPONSE: {ai_text}")
        if citations:
            for c in citations:
                print(f"  CITATION: standard={c.standard}, clause={c.clause}")
        if ui_widget:
            print(f"  WIDGET: type={ui_widget.type}")
        print(f"{'='*60}")
        
        return ai_text, citations, ui_widget

# ------------------------------------------------------------------
# Quick Test — 4 queries covering all paths
# ------------------------------------------------------------------
if __name__ == "__main__":
    agent = AgenticRAGPipeline()
    
    async def run_test(query, label):
        print(f"\n[TEST] {label}")
        start = time.time()
        await agent.run(query)
        elapsed = time.time() - start
        print(f"[TIME] {elapsed:.4f} seconds\n")

    async def run_all():
        await run_test("What is the pH limit for water?", "DB Search with Retry Loop")
        await run_test("Can you compare amendments for IS 10500?", "Amendment Tool (DB Skipped)")
        await run_test("Export this chat as a report.", "Report Tool (DB Skipped)")
        await run_test("Hello there!", "General Chat (Everything Skipped)")

    asyncio.run(run_all())
