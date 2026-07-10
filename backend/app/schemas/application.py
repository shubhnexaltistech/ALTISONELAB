from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime


class ApplicationCreate(BaseModel):
    applicant_name: str
    email: EmailStr
    phone: str
    college: Optional[str] = None
    city: Optional[str] = None
    track_id: str
    track_name: str


class ApplicationResponse(BaseModel):
    id: str
    applicant_name: str
    email: str
    phone: str
    college: Optional[str] = None
    city: Optional[str] = None
    track_id: str
    track_name: str
    status: Literal["pending", "paid", "verified"]
    unique_id: Optional[str] = None
    created_at: datetime


class ApplicationListResponse(BaseModel):
    data: list[ApplicationResponse]
    total: int
    page: int
    pages: int


class VerifyApplicationResponse(BaseModel):
    message: str
    trainee_unique_id: str
