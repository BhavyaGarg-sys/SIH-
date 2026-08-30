from fastapi import APIRouter, Depends
from api.core.database import get_database
from api.core.deps import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/")
async def get_dashboard_data(user: dict = Depends(get_current_user)):
    db = get_database()
    
    # 1. User Profile Data
    user_doc = await db.users.find_one({"email": user["email"]})
    profile = user_doc.get("profile", {}) if user_doc else {}
    
    user_data = {
        "name": profile.get("name", user["email"].split('@')[0]),
        "role": profile.get("role", "Engineer"),
        "avatar": profile.get("name", user["email"].split('@')[0])[:2].upper(),
        "institution": profile.get("company_name", "Unknown Organization")
    }
    
    # 2. Metrics
    reports_count = await db.projects.count_documents({"user_id": user["id"]})
    bookmarks_count = await db.bookmarks.count_documents({"user_id": user["id"]})
    
    metrics = [
      {
        "id": "standards",
        "title": "Standards Accessed",
        "value": str(bookmarks_count),
        "trend": "+2 this week",
        "trendPositive": True,
        "icon": "BookOpen"
      },
      {
        "id": "reports",
        "title": "Research Reports",
        "value": str(reports_count),
        "trend": f"{reports_count} active workspaces",
        "trendPositive": True,
        "icon": "FileSpreadsheet"
      }
    ]
    
    # 3. Recent Activity (Merge Projects and Bookmarks)
    recent_activity = []
    
    projects_cursor = db.projects.find({"user_id": user["id"]}).sort("created_at", -1).limit(5)
    async for p in projects_cursor:
        recent_activity.append({
            "standard": p.get("standard_id", "N/A"),
            "title": p.get("title", "Project"),
            "action": "Generated Certification Roadmap",
            "date": "Recently",
            "status": p.get("status", "Active"),
            "type": "Workspace",
            "projectId": str(p["_id"])
        })
        
    bookmarks_cursor = db.bookmarks.find({"user_id": user["id"]}).limit(5)
    async for b in bookmarks_cursor:
        recent_activity.append({
            "standard": b.get("standard_ref", "N/A"),
            "title": "Bookmarked Clause",
            "action": b.get("note") or "Saved for reference",
            "date": "Recently",
            "status": "Saved",
            "type": "Bookmark"
        })
        
    return {
        "user": user_data,
        "metrics": metrics,
        "recentActivity": recent_activity
    }
