from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from api.schemas.auth import UserRegister, UserLogin, Token
from api.core.database import get_database
from api.core.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

router = APIRouter()

@router.post("/register", response_model=dict)
async def register_user(user: UserRegister):
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    
    # Save to MongoDB
    user_doc = {
        "email": user.email,
        "hashed_password": hashed_password,
        "user_type": user.user_type
    }
    await db.users.insert_one(user_doc)
    
    return {"status": "success", "message": f"User {user.email} registered successfully"}

# We use standard OAuth2PasswordRequestForm here so it works natively with FastAPI Swagger UI,
# but we can also keep the custom UserLogin JSON model route for flexible frontend use.
@router.post("/login", response_model=Token)
async def login_user(user: UserLogin):
    db = get_database()
    
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    # Generate JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["email"], "user_type": db_user.get("user_type", "msme")},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")
