import uuid
from fastapi import APIRouter, Depends
from typing import List
from api.schemas.chat import ChatMessageRequest, ChatMessageResponse, UIWidget, Citation
from api.services.intent_router import extract_intent
from api.services.rag_service import generate_rag_response
from api.core.database import get_database
from api.core.deps import get_current_user

router = APIRouter()

@router.get("/sessions")
async def get_chat_sessions(current_user: dict = Depends(get_current_user)):
    db = get_database()
    pipeline = [
        {"$match": {"user_email": current_user["email"]}},
        {"$sort": {"_id": 1}},
        {"$group": {
            "_id": "$session_id",
            "first_message": {"$first": "$content"},
            "created_at": {"$first": "$_id"}
        }},
        {"$sort": {"created_at": -1}}
    ]
    cursor = db.chats.aggregate(pipeline)
    sessions = await cursor.to_list(length=100)
    
    formatted_sessions = []
    for s in sessions:
        # Title is the first 4 words of the first message
        words = s.get("first_message", "New Chat").split()
        title = " ".join(words[:4]) + ("..." if len(words) > 4 else "")
        formatted_sessions.append({
            "session_id": s["_id"],
            "title": title
        })
    return formatted_sessions

@router.get("/project/{project_id}/sessions")
async def get_project_sessions(project_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    pipeline = [
        {"$match": {"user_email": current_user["email"], "project_id": project_id}},
        {"$sort": {"_id": 1}},
        {"$group": {
            "_id": "$session_id",
            "first_message": {"$first": "$content"},
            "created_at": {"$first": "$_id"}
        }},
        {"$sort": {"created_at": -1}}
    ]
    cursor = db.chats.aggregate(pipeline)
    sessions = await cursor.to_list(length=100)
    
    formatted_sessions = []
    for s in sessions:
        words = s.get("first_message", "New Chat").split()
        title = " ".join(words[:4]) + ("..." if len(words) > 4 else "")
        formatted_sessions.append({
            "session_id": s["_id"],
            "title": title
        })
    return formatted_sessions

@router.delete("/session/{session_id}")
async def delete_chat_session(session_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.chats.delete_many({"user_email": current_user["email"], "session_id": session_id})
    return {"deleted_count": result.deleted_count}

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.chats.find({"user_email": current_user["email"], "session_id": session_id}).sort("_id", 1)
    messages = await cursor.to_list(length=100)
    
    # Format for frontend
    formatted_msgs = []
    for msg in messages:
        formatted_msgs.append({
            "role": msg["role"],
            "content": msg["content"],
            "ui_widget": msg.get("ui_widget"),
            "citations": msg.get("citations", [])
        })
    return formatted_msgs

@router.post("/message", response_model=ChatMessageResponse)
async def process_chat_message(
    request: ChatMessageRequest, 
    current_user: dict = Depends(get_current_user)
):
    session_id = request.session_id or f"sess_{uuid.uuid4().hex[:8]}"
    project_id = request.project_id if hasattr(request, 'project_id') else getattr(request, 'project_id', None)
    
    db = get_database()
    
    # Save User Message
    await db.chats.insert_one({
        "user_email": current_user["email"],
        "session_id": session_id,
        "project_id": project_id,
        "role": "user",
        "content": request.message
    })
    
    # 1. Extract Intent using Gemini Structured Output
    intent_data = await extract_intent(request.message)
    
    # 2. RAG Generation (Internal Service Call)
    ai_text, citations = await generate_rag_response(request.message)
    
    ui_widget = None
    
    # 3. Attach UI Widgets if applicable
    if intent_data.intent == "CERTIFICATION" and request.interaction_mode == "guided_ui":
        product = intent_data.product or "your product"
        standard = intent_data.is_number or "IS 16102"
        
        ui_widget = UIWidget(
            type="COMPLIANCE_DASHBOARD",
            data={
                "standard": standard,
                "scheme": "CRS",
                "checklist": [
                    {"id": "c1", "title": f"Identify applicable IS standard for {product}"},
                    {"id": "c2", "title": "Setup In-House Testing Facility"},
                    {"id": "c3", "title": "Submit sample to BIS recognized lab"},
                    {"id": "c4", "title": "File application on Manak Online"}
                ]
            }
        )
            
    elif intent_data.intent == "VERIFICATION":
        ui_widget = UIWidget(
            type="HALLMARK_GUIDE",
            data={"instruction": "Enter the 6-digit HUID code below to verify."}
        )
        
    response = ChatMessageResponse(
        session_id=session_id,
        ai_text=ai_text,
        ui_widget=ui_widget,
        citations=citations
    )
    
    # Save Assistant Message
    await db.chats.insert_one({
        "user_email": current_user["email"],
        "session_id": session_id,
        "project_id": project_id,
        "role": "assistant",
        "content": ai_text,
        "ui_widget": ui_widget.dict() if ui_widget else None,
        "citations": [c.dict() for c in citations]
    })
    
    return response
