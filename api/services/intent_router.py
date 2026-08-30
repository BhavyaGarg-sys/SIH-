import os
from pydantic import BaseModel, Field
from typing import Optional, Literal
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Initialize Gemini client
# It automatically picks up GEMINI_API_KEY. We also support LLM_API_KEY for backward compatibility.
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY")
client = genai.Client(api_key=api_key)
MODEL_NAME = os.getenv("LLM_MODEL", "gemini-2.5-flash")

class QueryIntent(BaseModel):
    intent: Literal["CERTIFICATION", "VERIFICATION", "TECHNICAL_QUERY", "EXPORT_REPORT", "COMPARE_AMENDMENTS", "GENERAL"] = Field(description="Strictly one of: 'CERTIFICATION', 'VERIFICATION', 'TECHNICAL_QUERY', 'EXPORT_REPORT', 'GENERAL'")
    product: Optional[str] = Field(description="The general product name mentioned (e.g. 'LED Bulb', 'Helmet'). Null if not mentioned.")
    is_number: Optional[str] = Field(description="The IS standard number if explicitly mentioned (e.g. 'IS 16102'). Null if not mentioned.")

async def extract_intent(user_message: str) -> QueryIntent:
    """
    Uses Gemini's native Structured Outputs to extract user intent.
    This guarantees a valid Pydantic object response.
    """
    system_prompt = (
        "You are an intelligent routing assistant for the Bureau of Indian Standards (BIS).\n"
        "Your job is to analyze the user's message and categorize their intent.\n"
        "1. CERTIFICATION: The user wants to know how to certify, manufacture, or launch a product.\n"
        "2. VERIFICATION: The user wants to verify a hallmark, ISI mark, or consumer purchase.\n"
        "3. TECHNICAL_QUERY: The user is asking a specific technical question about a standard's rules, dimensions, or testing criteria.\n"
        "4. EXPORT_REPORT: The user wants to export, download, or summarize the conversation as a report.\n"
        "6. GENERAL: Greeting or unrelated queries."
    )

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[
            system_prompt,
            user_message
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": QueryIntent,
            "temperature": 0.0,
        }
    )

    return response.parsed
