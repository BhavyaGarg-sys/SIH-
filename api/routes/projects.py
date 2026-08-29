import uuid
import io
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
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
        status=doc.get("status", "PLANNING"),
        steps=[ChecklistStep(**step) for step in doc.get("steps", [])],
        saved_labs=doc.get("saved_labs", [])
    )

from pydantic import BaseModel
from api.services.rag_service import generate_rag_response
from api.schemas.projects import ProjectStatusUpdate

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
        "status": "PLANNING",
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
        "status": "PLANNING",
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

@router.get("/{project_id}/export")
async def export_project_pdf(project_id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        obj_id = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    project = await db.projects.find_one({"_id": obj_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    user_doc = await db.users.find_one({"email": user["email"]})
    profile = user_doc.get("profile", {}) if user_doc else {}
    company_name = profile.get("company_name", "Unknown Company")
    sector = profile.get("industry_sector", "N/A")
    state = profile.get("state", "N/A")
    
    # Fetch bookmarks
    bookmarks_cursor = db.bookmarks.find({"user_id": user["id"]})
    bookmarks = await bookmarks_cursor.to_list(length=100)
    
    # Generate PDF in memory
    buffer = io.BytesIO()
    from reportlab.lib.units import inch
    from reportlab.platypus import PageBreak
    
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    subtitle_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # Custom styles
    title_style.alignment = 1 # Center
    
    elements = []
    
    # Header
    elements.append(Paragraph("M?naK AI - Compliance Roadmap", title_style))
    elements.append(Spacer(1, 12))
    
    date_str = datetime.utcnow().strftime("%B %d, %Y")
    elements.append(Paragraph(f"<b>Date Generated:</b> {date_str}", normal_style))
    elements.append(Spacer(1, 12))
    
    elements.append(Paragraph(f"<b>Project:</b> {project.get('title', 'N/A')}", normal_style))
    elements.append(Paragraph(f"<b>Company:</b> {company_name} ({sector}, {state})", normal_style))
    elements.append(Paragraph(f"<b>Standard:</b> {project.get('standard_id', 'N/A')}", normal_style))
    elements.append(Paragraph(f"<b>Status:</b> {project.get('status', 'PLANNING')}", normal_style))
    elements.append(Paragraph(f"<b>Progress:</b> {project.get('progress_percentage', 0)}%", normal_style))
    elements.append(Spacer(1, 24))
    
    elements.append(Paragraph("Action Items Checklist", subtitle_style))
    elements.append(Spacer(1, 12))
    
    # Table data
    data = [["Status", "Task", "Due Date"]]
    steps = project.get("steps", [])
    
    for step in steps:
        status_text = step.get("status", "PENDING").replace("_", " ")
        title_text = step.get("title", "")
        due = step.get("due_date", "-")
        if not due:
            due = "-"
            
        data.append([status_text, Paragraph(title_text, normal_style), due])
        
    # Table styling
    t = Table(data, colWidths=[80, 300, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e40af')), # blue-800
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')), # slate-50
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    elements.append(t)
    
    if bookmarks:
        elements.append(PageBreak())
        elements.append(Paragraph("Relevant Standards & Cited Clauses", title_style))
        elements.append(Spacer(1, 12))
        
        for bk in bookmarks:
            elements.append(Paragraph(f"<b>{bk.get('standard_ref', 'N/A')}</b>", subtitle_style))
            elements.append(Paragraph(f"<i>Clause:</i> {bk.get('clause_text', '')}", normal_style))
            if bk.get('note'):
                elements.append(Spacer(1, 6))
                elements.append(Paragraph(f"<b>Note:</b> {bk.get('note')}", normal_style))
            elements.append(Spacer(1, 18))
            
    def add_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setStrokeColor(colors.lightgrey)
        canvas.line(inch, 0.75 * inch, doc.pagesize[0] - inch, 0.75 * inch)
        canvas.drawString(inch, 0.5 * inch, "M?naK AI - Confidential Compliance Report")
        canvas.drawRightString(doc.pagesize[0] - inch, 0.5 * inch, f"Page {doc.page}")
        canvas.restoreState()
    
    # Build PDF
    doc.build(elements, onFirstPage=add_footer, onLaterPages=add_footer)
    buffer.seek(0)
    
    headers = {
        'Content-Disposition': f'attachment; filename="roadmap_{project_id}.pdf"'
    }
    
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers=headers)

@router.patch("/{project_id}", response_model=dict)
async def update_project_status(project_id: str, update: ProjectStatusUpdate, user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        obj_id = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    result = await db.projects.update_one(
        {"_id": obj_id, "user_id": user["id"]},
        {"$set": {"status": update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return {"status": "success", "new_status": update.status}

@router.post("/{project_id}/duplicate", response_model=ProjectResponse)
async def duplicate_project(project_id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        obj_id = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    source_project = await db.projects.find_one({"_id": obj_id, "user_id": user["id"]})
    if not source_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Reset steps to PENDING
    new_steps = []
    for step in source_project.get("steps", []):
        new_step = step.copy()
        new_step["status"] = "PENDING"
        new_steps.append(new_step)
        
    new_project = {
        "user_id": user["id"],
        "title": source_project.get("title", "Project") + " (Copy)",
        "standard_id": source_project.get("standard_id", ""),
        "scheme_id": source_project.get("scheme_id", ""),
        "progress_percentage": 0,
        "status": "PLANNING",
        "steps": new_steps,
        "saved_labs": source_project.get("saved_labs", []),
        "created_at": datetime.utcnow()
    }
    
    result = await db.projects.insert_one(new_project)
    new_project["_id"] = result.inserted_id
    
    return serialize_project(new_project)

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
            if update.status is not None:
                step["status"] = update.status
            if update.notes is not None:
                step["notes"] = update.notes
            if update.due_date is not None:
                step["due_date"] = update.due_date
            step_found = True
            
        if step.get("status") == "COMPLETED":
            completed_count += 1
            
    if not step_found:
        raise HTTPException(status_code=404, detail="Step not found in this project")
        
    new_progress = int((completed_count / len(steps)) * 100) if steps else 0
    
    # Update MongoDB
    await db.projects.update_one(
        {"_id": obj_id, "steps.id": step_id},
        {
            "$set": {
                "steps.$": next(s for s in steps if s["id"] == step_id),
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
    due_date: Optional[str] = None

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
        "status": "PENDING",
        "due_date": request.due_date
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
    await db.chats.delete_many({"project_id": project_id})
    return None
