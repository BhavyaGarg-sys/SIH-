from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatMessageRequest(BaseModel):
    message: str
    interaction_mode: str = "guided_ui"
    session_id: Optional[str] = None
    project_id: Optional[str] = None

class Citation(BaseModel):
    standard: str
    clause: str
    snippet: Optional[str] = None

class UIWidget(BaseModel):
    type: str = Field(..., description="E.g., COMPLIANCE_DASHBOARD, CHECKPOINT_SELECTION")
    data: Dict[str, Any] = Field(..., description="Widget-specific payload")

class ChatMessageResponse(BaseModel):
    session_id: str
    ai_text: str
    ui_widget: Optional[UIWidget] = None
    citations: List[Citation] = []
