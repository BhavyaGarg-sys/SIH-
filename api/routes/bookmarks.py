from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime
from api.schemas.bookmarks import BookmarkCreate, BookmarkUpdate, BookmarkResponse
from api.core.database import get_database
from api.core.deps import get_current_user

router = APIRouter()

def serialize_bookmark(doc) -> BookmarkResponse:
    return BookmarkResponse(
        id=str(doc["_id"]),
        standard_ref=doc["standard_ref"],
        clause_text=doc["clause_text"],
        pdf_path=doc.get("pdf_path"),
        page_number=doc.get("page_number"),
        note=doc.get("note"),
        created_at=doc.get("created_at", datetime.utcnow()).isoformat()
    )

@router.post("/", response_model=BookmarkResponse)
async def create_bookmark(bookmark: BookmarkCreate, user: dict = Depends(get_current_user)):
    db = get_database()
    
    new_bookmark = bookmark.dict()
    new_bookmark["user_id"] = user["id"]
    new_bookmark["created_at"] = datetime.utcnow()
    
    result = await db.bookmarks.insert_one(new_bookmark)
    new_bookmark["_id"] = result.inserted_id
    
    return serialize_bookmark(new_bookmark)

@router.get("/", response_model=List[BookmarkResponse])
async def list_bookmarks(user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.bookmarks.find({"user_id": user["id"]}).sort("created_at", -1)
    bookmarks = await cursor.to_list(length=100)
    return [serialize_bookmark(b) for b in bookmarks]

@router.patch("/{bookmark_id}", response_model=BookmarkResponse)
async def update_bookmark(bookmark_id: str, update: BookmarkUpdate, user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        obj_id = ObjectId(bookmark_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.bookmarks.update_one(
        {"_id": obj_id, "user_id": user["id"]},
        {"$set": {"note": update.note}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
        
    doc = await db.bookmarks.find_one({"_id": obj_id})
    return serialize_bookmark(doc)

@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(bookmark_id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        obj_id = ObjectId(bookmark_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.bookmarks.delete_one({"_id": obj_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return None
