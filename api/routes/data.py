from fastapi import APIRouter
from typing import List, Optional

router = APIRouter()

@router.get("/labs")
async def get_labs(product_category: Optional[str] = None, state: Optional[str] = None):
    """Fetch geo-aware labs for completing project steps."""
    # TODO: Query MongoDB or local JSON file
    return [
        {
            "id": "lab_001",
            "name": "Delhi Quality Testing Centre",
            "state": "Delhi",
            "supported_standards": ["IS 16102"]
        }
    ]

@router.get("/schemes")
async def get_schemes():
    """Fetch raw BIS schemes available."""
    # TODO: Return structured rules
    return [
        {"id": "CRS", "name": "Compulsory Registration Scheme"},
        {"id": "ISI", "name": "ISI Mark Scheme"}
    ]

import json
import re
from api.services.rag_service import generate_rag_response

@router.get("/comparison-report")
async def get_comparison_report(topic: str = "Seismic Detailing Comparison: IS 1893 vs IS 13920"):
    """Dynamically generate structured comparison data for ComparisonView using the AI."""
    
    prompt = f"""
    You are an expert compliance engine for Indian Standards (IS codes). 
    Generate a comparison report on: {topic}. 
    
    You MUST respond ONLY with a raw JSON object matching EXACTLY this schema (no markdown, no backticks, no explanations):
    {{
      "title": "{topic}",
      "subtitle": "AI-generated cross-reference analysis",
      "differences": [
        {{
          "aspect": "<Aspect name>",
          "delta": "<Short summary of delta>",
          "code1": "<Description according to the first code>",
          "code2": "<Description according to the second code>"
        }}
      ],
      "citingSources": [
        {{ "id": "1", "code": "IS XXXX", "title": "<Full title of code>", "relevance": 95 }}
      ],
      "followUpQuestions": [
        "<Interesting follow-up question 1?>", 
        "<Interesting follow-up question 2?>"
      ]
    }}
    
    Include EXACTLY 3 differences, 2 citing sources, and 3 follow-up questions.
    """
    
    ai_text, citations = await generate_rag_response(prompt, top_k=3)
    
    try:
        # Strip any accidental markdown formatting (like ```json ... ```)
        clean_text = re.sub(r'```(?:json)?\n?', '', ai_text).replace('```', '').strip()
        data = json.loads(clean_text)
        return data
    except Exception as e:
        print(f"Failed to parse LLM comparison response: {e}\nRaw Text: {ai_text}")
        # Fallback to a safe mock if the LLM hallucinates formatting
        return {
          "title": topic,
          "subtitle": "Fallback due to AI generation timeout",
          "differences": [
              {
                  "aspect": "Generation Failed",
                  "delta": "AI response format was invalid",
                  "code1": "Please try again later.",
                  "code2": "Check backend logs for details."
              }
          ],
          "citingSources": [],
          "followUpQuestions": ["Try regenerating the report?"]
        }
