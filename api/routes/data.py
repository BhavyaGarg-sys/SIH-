from fastapi import APIRouter, Depends
from api.routes.auth import get_current_user
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

