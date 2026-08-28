from pydantic import BaseModel
from typing import List, Optional

class ChecklistStep(BaseModel):
    id: str
    title: str
    status: str = "PENDING" # PENDING, IN_PROGRESS, COMPLETED
    notes: Optional[str] = None

class ProjectCreate(BaseModel):
    title: str
    standard_id: str
    scheme_id: str
    initial_steps: List[ChecklistStep]
    session_id: Optional[str] = None

class ProjectResponse(BaseModel):
    project_id: str
    title: str
    standard_id: str
    scheme_id: str
    progress_percentage: int
    steps: List[ChecklistStep]
    saved_labs: List[dict] = []

class StepUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
