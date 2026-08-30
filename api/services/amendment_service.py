import os
import json
from google import genai
from pydantic import BaseModel, Field
from typing import List

LLM_API_KEY = os.getenv("LLM_API_KEY")
client = genai.Client(api_key=LLM_API_KEY)
MODEL_NAME = os.getenv("LLM_MODEL", "gemini-2.5-flash")

class ComparisonItem(BaseModel):
    topic: str = Field(description="The specific parameter or rule being changed")
    old_guideline: str = Field(description="What the previous rule/guideline was")
    new_amendment: str = Field(description="What the new rule/amendment is")
    impact: str = Field(description="Short note on how this affects manufacturers")

class AmendmentData(BaseModel):
    title: str = Field(description="Title of the comparison (e.g. 'IS 16102 - Amendment Comparison')")
    ai_overview: str = Field(description="A concise 2-3 sentence overview explaining the major shifts")
    comparisons: List[ComparisonItem] = Field(description="List of specific changes")

async def generate_amendment_comparison(product_name: str, standard_number: str = None) -> dict:
    """
    In a real app, this would first query RAG to get the old vs new text.
    For this prototype, we'll prompt the LLM to generate a realistic mock comparison based on its training data.
    """
    
    prompt = f"""
    You are an expert BIS (Bureau of Indian Standards) compliance consultant.
    The user is asking for a comparison of recent amendments to the standards for the product: {product_name}.
    If a standard number is provided ({standard_number}), focus on that. If not, use the most common IS standard for this product.
    
    Generate a highly realistic side-by-side comparison of 3 to 4 major rule changes (e.g., testing criteria, labeling requirements, tolerances, material specs).
    Provide the previous guideline, the new amended guideline, and the impact it has on manufacturers.
    """
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": AmendmentData,
            "temperature": 0.2
        }
    )
    
    try:
        data = json.loads(response.text)
        return data
    except Exception as e:
        return {
            "title": f"Amendment Comparison - {product_name}",
            "ai_overview": "Failed to generate comparison data.",
            "comparisons": []
        }
