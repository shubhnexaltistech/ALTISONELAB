from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime


class UserProfile(BaseModel):
    name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    college: Optional[str] = None
    city: Optional[str] = None


class User(Document):
    role: Literal["admin", "trainee", "mentor"]
    email: Optional[str] = None
    unique_id: Optional[str] = None
    emp_id: Optional[str] = None
    hashed_password: str
    profile: UserProfile
    track_id: Optional[str] = None
    application_id: Optional[str] = None
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"
        indexes = [
            [("email", 1)],
            [("unique_id", 1)],
            [("emp_id", 1)],
            [("role", 1), ("track_id", 1)],
            [("role", 1), ("is_active", 1)],
        ]
