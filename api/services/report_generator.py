import os
import json
from google import genai
from pydantic import BaseModel, Field
from typing import List

# Setup Gemini Client
LLM_API_KEY = os.getenv("LLM_API_KEY")
client = genai.Client(api_key=LLM_API_KEY)
MODEL_NAME = os.getenv("LLM_MODEL", "gemini-2.5-flash")

class ReportData(BaseModel):
    title: str = Field(description="A formal title for the compliance consultation report (e.g. 'BIS Compliance Report: LED Bulbs')")
    executive_summary: str = Field(description="A professional 2-3 paragraph summary using GitHub flavored Markdown. Focus on the core objective and overall outcome.")
    key_findings: List[str] = Field(description="Bullet points of the main regulatory facts, rules, and findings established during the chat.")
    action_items: List[str] = Field(description="A sequential list of clear, actionable next steps for the user.")
    required_documents: List[str] = Field(description="A list of specific forms, test reports, or documents mentioned in the chat.")
    standards_cited: List[str] = Field(description="A list of specific IS standards, clauses, or Quality Control Orders (QCOs) discussed.")
    risk_factors: List[str] = Field(description="Any warnings, penalties, or compliance risks mentioned in the chat.")

async def generate_chat_report(chat_history: List[dict], user_profile: dict = None) -> dict:
    # Format the chat history into a transcript for the LLM
    transcript = ""
    for msg in chat_history:
        role = "User" if msg.get("role") == "user" else "AI Consultant"
        transcript += f"{role}: {msg.get('content', '')}\n"
        citations = msg.get("citations", [])
        if citations:
            # Strip out unnecessary fields to save tokens, just keep standard and clause
            simplified_citations = [{"standard": c.get("standard"), "clause": c.get("clause")} for c in citations]
            transcript += f"   [Citations provided by AI: {json.dumps(simplified_citations)}]\n"
        transcript += "\n"
        
    prompt = f"""
    You are an expert BIS (Bureau of Indian Standards) regulatory compliance consultant.
    The user wants to export their recent consultation chat into a formal, management-ready PDF report.
    
    Please read the following transcript. It contains the back-and-forth between the user and the AI consultant, including explicit regulatory citations used to answer the user.
    
    Your job is to synthesize this raw chat log into a structured, highly professional compliance report.
    - Be objective, authoritative, and clear.
    - Do not invent rules; rely strictly on the standards and clauses cited in the transcript.
    - Ensure action items are sequential and logical.
    - Output plain text for the executive summary, do NOT use markdown formatting (no asterisks or hashes).
    
    User Profile Context: {json.dumps(user_profile) if user_profile else "None"}
    
    --- TRANSCRIPT ---
    {transcript}
    --- END TRANSCRIPT ---
    """
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ReportData,
            "temperature": 0.1
        }
    )
    
    try:
        data = json.loads(response.text)
        return data
    except Exception as e:
        # Fallback empty structure
        return {
            "title": "Compliance Consultation Report",
            "executive_summary": "Failed to generate summary.",
            "action_items": [],
            "standards_cited": []
        }
