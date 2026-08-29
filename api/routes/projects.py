import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from api.schemas.projects import ProjectCreate, ProjectResponse, StepUpdate, ChecklistStep
from api.core.database import get_database
from api.core.deps import get_current_user

router = APIRouter()

def serialize_project(doc) -> ProjectResponse:
    """Helper to convert MongoDB document to Pydantic Response."""
    return ProjectResponse(
        project_id=str(doc["_id"]),
        title=doc["title"],
        standard_id=doc["standard_id"],
        scheme_id=doc["scheme_id"],
        progress_percentage=doc.get("progress_percentage", 0),
        steps=[ChecklistStep(**step) for step in doc.get("steps", [])],
        saved_labs=doc.get("saved_labs", [])
    )

from pydantic import BaseModel
from api.services.rag_service import generate_rag_response

class ProjectGenerateRequest(BaseModel):
    product: str
    role: str

@router.post("/generate")
async def generate_project(request: ProjectGenerateRequest, user: dict = Depends(get_current_user)):
    db = get_database()
    
    # 1. Ask the AI to figure out the standard and checklist
    prompt = f"I am a {request.role} looking to manufacture and certify {request.product} in India. What is the IS Standard? Please provide a 4-step certification checklist. Keep it short."
    
    # We use our internal RAG service (this saves us from duplicating logic)
    ai_text, citations = await generate_rag_response(prompt)
    
    # Normally, you'd extract structured JSON from the AI here. 
    # For MVP, we will extract simple heuristics or hardcode a template based on the product.
    standard_id = "IS 16102" if "LED" in request.product.upper() else ("IS 4151" if "HELMET" in request.product.upper() else "IS 1234")
    
    steps = [
        {"id": "c1", "title": f"Identify applicable IS standard ({standard_id})", "status": "PENDING"},
        {"id": "c2", "title": "Setup In-House Testing Facility", "status": "PENDING"},
        {"id": "c3", "title": "Submit sample to BIS recognized lab", "status": "PENDING"},
        {"id": "c4", "title": "File application on Manak Online", "status": "PENDING"}
    ]
    
    new_project = {
        "user_id": user["id"],
        "title": f"{request.product} Certification",
        "standard_id": standard_id,
        "scheme_id": "CRS",
        "progress_percentage": 0,
        "steps": steps,
        "saved_labs": [],
        "created_at": datetime.utcnow()
    }
    
    result = await db.projects.insert_one(new_project)
    
    # Seed the chat history with the initial prompt and response so the workspace isn't empty!
    project_id = str(result.inserted_id)
    # The first chat thread in the project needs its own session ID
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    
    await db.chats.insert_one({
        "user_email": user["email"],
        "session_id": session_id,
        "project_id": project_id, # Link chat to this project
        "role": "user",
        "content": prompt
    })
    
    await db.chats.insert_one({
        "user_email": user["email"],
        "session_id": session_id,
        "project_id": project_id,
        "role": "assistant",
        "content": ai_text,
        "ui_widget": None,
        "citations": [c.dict() for c in citations]
    })
    
    return {"project_id": project_id}

@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, user: dict = Depends(get_current_user)):
    db = get_database()
    
    steps = [step.dict() for step in project.initial_steps]
    
    new_project = {
        "user_id": user["id"],
        "title": project.title,
        "standard_id": project.standard_id,
        "scheme_id": project.scheme_id,
        "progress_percentage": 0,
        "steps": steps,
        "saved_labs": [],
        "created_at": datetime.utcnow()
    }
    
    result = await db.projects.insert_one(new_project)
    new_project["_id"] = result.inserted_id
    project_id = str(result.inserted_id)
    
    # If the user saved this project from an existing chat, link the chat to this workspace!
    if project.session_id:
        await db.chats.update_many(
            {"session_id": project.session_id},
            {"$set": {"project_id": project_id}}
        )
    
    return serialize_project(new_project)

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Fetch all projects for this user, sorted newest first
    cursor = db.projects.find({"user_id": user["id"]}).sort("created_at", -1)
    projects = await cursor.to_list(length=100)
    
    return [serialize_project(proj) for proj in projects]

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    
    try:
        obj_id = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    project = await db.projects.find_one({"_id": obj_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return serialize_project(project)

@router.patch("/{project_id}/checklist/{step_id}", response_model=dict)
async def update_step_status(project_id: str, step_id: str, update: StepUpdate, user: dict = Depends(get_current_user)):
    db = get_database()
    
    try:
        obj_id = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    # First, verify project exists and belongs to user
    project = await db.projects.find_one({"_id": obj_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Find the specific step and update it in memory to calculate new percentage
    steps = project.get("steps", [])
    step_found = False
    completed_count = 0
    
    for step in steps:
        if step["id"] == step_id:
            step["status"] = update.status
            if update.notes is not None:
                step["notes"] = update.notes
            step_found = True
            
        if step["status"] == "COMPLETED":
            completed_count += 1
            
    if not step_found:
        raise HTTPException(status_code=404, detail="Step not found in this project")
        
    new_progress = int((completed_count / len(steps)) * 100) if steps else 0
    
    # Update MongoDB
    await db.projects.update_one(
        {"_id": obj_id, "steps.id": step_id},
        {
            "$set": {
                "steps.$.status": update.status,
                "steps.$.notes": update.notes if update.notes is not None else "",
                "progress_percentage": new_progress
            }
        }
    )
    
    return {
        "status": "success", 
        "message": f"Step {step_id} updated", 
        "new_progress": new_progress
    }

class NewStepRequest(BaseModel):
    title: str

@router.post("/{project_id}/checklist", response_model=dict)
async def add_checklist_step(project_id: str, request: NewStepRequest, user: dict = Depends(get_current_user)):
    db = get_database()
    
    try:
        obj_id = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    project = await db.projects.find_one({"_id": obj_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    new_step_id = "c" + str(uuid.uuid4())[:8]
    new_step = {
        "id": new_step_id,
        "title": request.title,
        "status": "PENDING"
    }
    
    steps = project.get("steps", [])
    steps.append(new_step)
    
    completed_count = sum(1 for s in steps if s.get("status") == "COMPLETED")
    new_progress = int((completed_count / len(steps)) * 100) if steps else 0
    
    await db.projects.update_one(
        {"_id": obj_id},
        {
            "$push": {"steps": new_step},
            "$set": {"progress_percentage": new_progress}
        }
    )
    
    return {"status": "success", "step": new_step, "new_progress": new_progress}

@router.delete("/{project_id}/checklist/{step_id}", response_model=dict)
async def delete_checklist_step(project_id: str, step_id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    
    try:
        obj_id = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    project = await db.projects.find_one({"_id": obj_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    steps = [s for s in project.get("steps", []) if s["id"] != step_id]
    
    completed_count = sum(1 for s in steps if s.get("status") == "COMPLETED")
    new_progress = int((completed_count / len(steps)) * 100) if steps else 0
    
    await db.projects.update_one(
        {"_id": obj_id},
        {
            "$pull": {"steps": {"id": step_id}},
            "$set": {"progress_percentage": new_progress}
        }
    )
    
    return {"status": "success", "message": "Step deleted", "new_progress": new_progress}

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    
    try:
        obj_id = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    result = await db.projects.delete_one({"_id": obj_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Also delete associated chat history to keep DB clean
    await db.chats.delete_many({"session_id": project_id})
    return None
