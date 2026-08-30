from fastapi import APIRouter, Depends, HTTPException, status
from bson.objectid import ObjectId
from typing import Optional
from api.core.database import get_database
from api.core.deps import get_current_user
from api.routes.projects import get_project_with_role

router = APIRouter()

@router.get("/{report_id}")
async def get_report(report_id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    
    try:
        obj_id = ObjectId(report_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid report ID format")
        
    report = await db.reports.find_one({"_id": obj_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    # Check authorization via project role
    project_id = report.get("project_id")
    if not project_id:
        raise HTTPException(status_code=403, detail="Report has no associated project")
        
    # This will raise an exception if the user doesn't have access to the project
    await get_project_with_role(db, project_id, user)
        
    # Serialize ObjectId for frontend
    report["_id"] = str(report["_id"])
    return report
