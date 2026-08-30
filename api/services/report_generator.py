import os
import json
from google import genai
from pydantic import BaseModel, Field
from typing import List

# Setup Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)
MODEL_NAME = os.getenv("LLM_MODEL", "gemini-2.5-flash")

class ReportData(BaseModel):
    title: str = Field(description="A formal title for the compliance consultation report")
    executive_summary: str = Field(description="A professional 2-3 paragraph summary of the entire conversation")
    action_items: List[str] = Field(description="A list of clear, actionable next steps for the user")
    standards_cited: List[str] = Field(description="A list of specific IS standards or schemes discussed (e.g. 'IS 16102')")

async def generate_chat_report(chat_history: List[dict], user_profile: dict = None) -> dict:
    # Format the chat history into a transcript for the LLM
    transcript = ""
    for msg in chat_history:
        role = "User" if msg.get("role") == "user" else "AI Consultant"
        transcript += f"{role}: {msg.get('content', '')}\n\n"
        
    prompt = f"""
    You are an expert BIS (Bureau of Indian Standards) compliance consultant.
    The user wants to export their recent consultation chat into a formal PDF report.
    
    Please read the following transcript and generate a structured report.
    Make it sound highly professional, actionable, and ready to be presented to management.
    
    User Profile Context (if any): {json.dumps(user_profile) if user_profile else "None"}
    
    --- TRANSCRIPT ---
    {transcript}
    --- END TRANSCRIPT ---
    
    Generate the report based on this transcript.
    """
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ReportData,
            "temperature": 0.2
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
