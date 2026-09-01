import uuid
import json
from fastapi import APIRouter
from fastapi import Depends
from fastapi.responses import StreamingResponse
from typing import List
from api.schemas.chat import ChatMessageRequest, ChatMessageResponse, UIWidget, Citation
from AGENTICragPIPE import AgenticRAGPipeline
agentic_rag = AgenticRAGPipeline()
from api.services.rag_service import generate_rag_response
from api.services.report_generator import generate_chat_report
from api.services.amendment_service import generate_amendment_comparison
from api.core.database import get_database
from api.core.deps import get_current_user
from api.routes.projects import get_project_with_role

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
    # Verify access to project
    await get_project_with_role(db, project_id, current_user)
    
    pipeline = [
        {"$match": {"project_id": project_id}},
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
    
    first_msg = await db.chats.find_one({"session_id": session_id})
    if not first_msg:
        return {"deleted_count": 0}
        
    if first_msg.get("project_id"):
        # Ensure user is OWNER or EDITOR
        await get_project_with_role(db, first_msg["project_id"], current_user, required_roles=["OWNER", "EDITOR"])
        # Delete entire session regardless of user_email
        result = await db.chats.delete_many({"session_id": session_id})
    else:
        # Personal session
        result = await db.chats.delete_many({"user_email": current_user["email"], "session_id": session_id})
        
    return {"deleted_count": result.deleted_count}

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Check first message to see if it's tied to a project
    first_msg = await db.chats.find_one({"session_id": session_id})
    if not first_msg:
        return []
        
    if first_msg.get("project_id"):
        # Verify project access
        await get_project_with_role(db, first_msg["project_id"], current_user)
        # Fetch all messages in this session regardless of user_email
        cursor = db.chats.find({"session_id": session_id}).sort("_id", 1)
    else:
        # General chat
        cursor = db.chats.find({"user_email": current_user["email"], "session_id": session_id}).sort("_id", 1)
    messages = await cursor.to_list(length=100)
    
    # Format for frontend
    formatted_msgs = []
    for msg in messages:
        formatted_msgs.append({
            "id": str(msg["_id"]),
            "role": msg["role"],
            "content": msg["content"],
            "ui_widget": msg.get("ui_widget"),
            "citations": msg.get("citations", []),
            "intent": msg.get("intent")
        })
    return formatted_msgs

@router.post("/message")
async def process_chat_message(
    request: ChatMessageRequest, 
    current_user: dict = Depends(get_current_user)
):
    session_id = request.session_id or f"sess_{uuid.uuid4().hex[:8]}"
    project_id = request.project_id if hasattr(request, 'project_id') else getattr(request, 'project_id', None)
    
    db = get_database()
    
    if project_id:
        await get_project_with_role(db, project_id, current_user, required_roles=["OWNER", "EDITOR"])

    # Save User Message
    await db.chats.insert_one({
        "user_email": current_user["email"],
        "session_id": session_id,
        "project_id": project_id,
        "role": "user",
        "content": request.message
    })
    
    db_user = await db.users.find_one({"email": current_user["email"]})
    user_profile = db_user.get("profile") if db_user else None
    
    # 1. Run the agentic pipeline to route, evaluate, and retrieve
    agent_state = await agentic_rag.run(request.message)
    decision = agent_state.get("decision", "general")
    documents = agent_state.get("documents", [])
    
    ui_widget = None
    citations = []
    full_ai_text = ""
    
    if decision == "report":
        cursor = db.chats.find({"session_id": session_id}).sort("_id", 1)
        chat_history = await cursor.to_list(length=100)
        report_data = await generate_chat_report(chat_history, user_profile)
        
        result = await db.reports.insert_one({
            "session_id": session_id,
            "project_id": project_id,
            "user_email": current_user["email"],
            "data": report_data
        })
        report_id = str(result.inserted_id)
        
        ui_widget = UIWidget(type="REPORT_LINK", data={"report_id": report_id, "title": report_data.get("title", "Exported Report")})
        full_ai_text = "I've generated a formal PDF report based on our conversation. Click the button below to view and download it."
        
    elif decision == "compare":
        product = "the requested product"
        amendment_data = await generate_amendment_comparison(product, None)
        
        result = await db.reports.insert_one({
            "session_id": session_id,
            "project_id": project_id,
            "user_email": current_user["email"],
            "type": "AMENDMENT",
            "data": amendment_data
        })
        report_id = str(result.inserted_id)
        
        ui_widget = UIWidget(type="COMPARISON_LINK", data={"comparison_id": report_id, "title": amendment_data.get("title", "Amendment Comparison")})
        full_ai_text = f"I've generated a side-by-side comparison of the recent amendments for {product}. Click below to open it in a new page."
        
    elif decision == "certification" and request.interaction_mode == "guided_ui":
        import re
        match = re.search(r'(IS\s*\d+)', request.message, re.IGNORECASE)
        standard = match.group(1).upper() if match else "your requested standard"
        product = "your product"
        ui_widget = UIWidget(type="COMPLIANCE_DASHBOARD", data={"standard": standard, "scheme": "CRS", "checklist": [{"id": "c1", "title": f"Identify applicable IS standard for {product}"}, {"id": "c2", "title": "Setup In-House Testing Facility"}, {"id": "c3", "title": "Submit sample to BIS recognized lab"}, {"id": "c4", "title": "File application on Manak Online"}]})
        full_ai_text = f"Here is the guided compliance dashboard for {product} under {standard}."
        
    elif decision == "verification":
        ui_widget = UIWidget(type="HALLMARK_GUIDE", data={"instruction": "Enter the 6-digit HUID code below to verify."})
        full_ai_text = "Please use the widget below to verify the HUID."
        
    else:
        # Standard Chat: generate synchronously
        from api.services.rag_service import generate_rag_response
        full_ai_text, citations = await generate_rag_response(request.message, user_profile=user_profile, pre_retrieved_docs=documents)

    # Save Assistant Message to DB
    await db.chats.insert_one({
        "user_email": current_user["email"],
        "session_id": session_id,
        "project_id": project_id,
        "role": "assistant",
        "content": full_ai_text,
        "ui_widget": ui_widget.dict() if ui_widget else None,
        "citations": [c.dict() for c in citations],
        "intent": decision.upper()
    })
    
    return ChatMessageResponse(
        session_id=session_id,
        ai_text=full_ai_text,
        ui_widget=ui_widget,
        citations=citations,
        intent=decision.upper()
    )
