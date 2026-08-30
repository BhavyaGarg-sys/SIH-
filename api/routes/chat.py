import uuid
from fastapi import APIRouter, Depends
from typing import List
from api.schemas.chat import ChatMessageRequest, ChatMessageResponse, UIWidget, Citation
from api.services.intent_router import extract_intent
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

@router.post("/message", response_model=ChatMessageResponse)
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
    
    # 1 & 2. Run Intent Extraction and RAG Generation IN PARALLEL
    import asyncio
    intent_data, (ai_text, citations) = await asyncio.gather(
        extract_intent(request.message),
        generate_rag_response(request.message, user_profile=user_profile)
    )
    
    ui_widget = None
    
    # 3. Attach UI Widgets if applicable
    if intent_data.intent == "EXPORT_REPORT":
        # Fetch the chat history for the LLM
        cursor = db.chats.find({"session_id": session_id}).sort("_id", 1)
        chat_history = await cursor.to_list(length=100)
        
        report_data = await generate_chat_report(chat_history, user_profile)
        
        # Save to reports collection
        report_doc = {
            "session_id": session_id,
            "project_id": project_id,
            "user_email": current_user["email"],
            "data": report_data
        }
        result = await db.reports.insert_one(report_doc)
        report_id = str(result.inserted_id)
        
        # Create a report link widget
        ui_widget = UIWidget(
            type="REPORT_LINK",
            data={
                "report_id": report_id,
                "title": report_data.get("title", "Exported Report")
            }
        )
        ai_text = "I've generated a formal PDF report based on our conversation. Click the button below to view and download it."
        citations = []
        
    elif intent_data.intent == "COMPARE_AMENDMENTS":
        product = intent_data.product or "the requested product"
        amendment_data = await generate_amendment_comparison(product, intent_data.is_number)
        
        # Save to reports collection with type flag
        report_doc = {
            "session_id": session_id,
            "project_id": project_id,
            "user_email": current_user["email"],
            "type": "AMENDMENT",
            "data": amendment_data
        }
        result = await db.reports.insert_one(report_doc)
        report_id = str(result.inserted_id)
        
        ui_widget = UIWidget(
            type="COMPARISON_LINK",
            data={
                "comparison_id": report_id,
                "title": amendment_data.get("title", "Amendment Comparison")
            }
        )
        ai_text = f"I've generated a side-by-side comparison of the recent amendments for {product}. Click below to open it in a new page."
        citations = []

    elif intent_data.intent == "CERTIFICATION" and request.interaction_mode == "guided_ui":
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
        citations=citations,
        intent=intent_data.intent if hasattr(intent_data, 'intent') else "GENERAL"
    )
    
    # Save Assistant Message
    await db.chats.insert_one({
        "user_email": current_user["email"],
        "session_id": session_id,
        "project_id": project_id,
        "role": "assistant",
        "content": ai_text,
        "ui_widget": ui_widget.dict() if ui_widget else None,
        "citations": [c.dict() for c in citations],
        "intent": intent_data.intent if hasattr(intent_data, 'intent') else "GENERAL"
    })
    
    return response
