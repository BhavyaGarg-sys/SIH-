from fastapi import APIRouter
from typing import List, Optional

router = APIRouter()

@router.get("/labs")
async def get_labs(product_category: Optional[str] = None, state: Optional[str] = None):
    \"\"\"Fetch geo-aware labs for completing project steps.\"\"\"
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
    \"\"\"Fetch raw BIS schemes available.\"\"\"
    # TODO: Return structured rules
    return [
        {"id": "CRS", "name": "Compulsory Registration Scheme"},
        {"id": "ISI", "name": "ISI Mark Scheme"}
    ]

@router.get("/comparison-report")
async def get_comparison_report():
    \"\"\"Return structured mock comparison data for ComparisonView.\"\"\"
    return {
        "title": "Seismic Detailing Comparison: IS 1893 vs IS 13920",
        "subtitle": "Cross-reference analysis generated on March 12, 2026",
        "differences": [
            {
                "aspect": "Zone Factors (Z)",
                "delta": "Values updated & rationalized",
                "code1": "Defines seismic zones II to V with factors ranging from 0.10 to 0.36. Strict adherence required for calculating base shear.",
                "code2": "Implicitly relies on IS 1893 zone factors. Mandates ductile detailing for all structures located in Zones III, IV, and V."
            },
            {
                "aspect": "Column Confinement",
                "delta": "Spacing reduced by 25%",
                "code1": "Provides generic structural framing requirements. Does not dictate precise hoop spacing for hinging zones.",
                "code2": "Explicitly requires special confining reinforcement. Maximum hoop spacing in the critical hinge region must not exceed 100mm or 1/4th minimum member dimension."
            },
            {
                "aspect": "Strong Column - Weak Beam",
                "delta": "1.4x Moment Capacity Enforced",
                "code1": "Recommends avoiding soft-storey mechanisms but lacks strict numerical enforcement for beam-column joints.",
                "code2": "Mandatory requirement: The sum of moment capacities of columns at a joint must be ? 1.4 times the sum of moment capacities of intersecting beams."
            },
            {
                "aspect": "Material Grade",
                "delta": "Fe 415 / 500 D mandatory",
                "code1": "Permits general structural grades of concrete (M20) and steel (Fe415) across standard zones.",
                "code2": "Minimum concrete grade M25 for buildings > 15m. Strict mandate to use High-Strength Deformed (HSD) bars of grade Fe 415, Fe 500, or Fe 500D with high elongation."
            }
        ],
        "citingSources": [
            {
                "id": "1",
                "code": "IS 1893 (Part 1):2016",
                "title": "Criteria for Earthquake Resistant Design of Structures",
                "relevance": 98
            },
            {
                "id": "2",
                "code": "IS 13920:2016",
                "title": "Ductile Design and Detailing of Reinforced Concrete Structures Subjected to Seismic Forces",
                "relevance": 95
            },
            {
                "id": "3",
                "code": "IS 456:2000",
                "title": "Plain and Reinforced Concrete - Code of Practice",
                "relevance": 72
            },
            {
                "id": "4",
                "code": "IS 800:2007",
                "title": "General Construction in Steel - Code of Practice",
                "relevance": 45
            }
        ],
        "followUpQuestions": [
            "How does the new 1.4x strong-column requirement impact existing pre-2016 designs?",
            "What is the allowed lap splice location for longitudinal bars under IS 13920?",
            "Can Fe550 grade steel be used in Zone V according to these codes?",
            "Extract the exact formula for base shear (VB) calculation."
        ]
    }
