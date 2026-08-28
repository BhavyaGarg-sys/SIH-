from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    user_type: str = "msme" # msme, consumer, student

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserProfile(BaseModel):
    company_name: Optional[str] = None
    industry_sector: Optional[str] = None
    state: Optional[str] = None
    profile_complete: Optional[bool] = False
