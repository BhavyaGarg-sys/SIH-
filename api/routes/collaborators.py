from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
from datetime import datetime
from api.core.database import get_database
from api.core.deps import get_current_user
from api.routes.projects import get_project_with_role

router = APIRouter()

class InviteRequest(BaseModel):
    email: str
    role: str

class RoleUpdateRequest(BaseModel):
    role: str

@router.get("/{project_id}/collaborators")
async def list_collaborators(project_id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    project, obj_id, user_role = await get_project_with_role(db, project_id, user)
    
    return project.get("members", [])

@router.post("/{project_id}/collaborators")
async def add_collaborator(project_id: str, request: InviteRequest, user: dict = Depends(get_current_user)):
    db = get_database()
    # Only OWNER can invite
    project, obj_id, user_role = await get_project_with_role(db, project_id, user, required_roles=["OWNER"])
    
    if request.role not in ["EDITOR", "VIEWER"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    if request.email.lower() == user["email"].lower():
        raise HTTPException(status_code=400, detail="Cannot invite yourself")
        
    # Check if user exists
    target_user = await db.users.find_one({"email": request.email.lower()})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if already a member
    members = project.get("members", [])
    if any(m["email"].lower() == request.email.lower() for m in members):
        raise HTTPException(status_code=400, detail="User is already a collaborator")
        
    new_member = {
        "user_id": str(target_user["_id"]),
        "email": target_user["email"],
        "role": request.role,
        "added_at": datetime.utcnow()
    }
    
    await db.projects.update_one(
        {"_id": obj_id},
        {"$push": {"members": new_member}}
    )
    
    return {"status": "success", "member": new_member}

@router.patch("/{project_id}/collaborators/{target_user_id}")
async def update_collaborator_role(project_id: str, target_user_id: str, request: RoleUpdateRequest, user: dict = Depends(get_current_user)):
    db = get_database()
    project, obj_id, user_role = await get_project_with_role(db, project_id, user, required_roles=["OWNER"])
    
    if request.role not in ["EDITOR", "VIEWER"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    if target_user_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    result = await db.projects.update_one(
        {"_id": obj_id, "members.user_id": target_user_id},
        {"$set": {"members.$.role": request.role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Collaborator not found")
        
    return {"status": "success", "message": "Role updated successfully"}

@router.delete("/{project_id}/collaborators/{target_user_id}")
async def remove_collaborator(project_id: str, target_user_id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    project, obj_id, user_role = await get_project_with_role(db, project_id, user, required_roles=["OWNER"])
    
    if target_user_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot remove yourself. Delete the project instead.")
        
    result = await db.projects.update_one(
        {"_id": obj_id},
        {"$pull": {"members": {"user_id": target_user_id}}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Collaborator not found")
        
    return {"status": "success", "message": "Collaborator removed successfully"}
