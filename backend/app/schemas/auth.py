from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    identifier: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class MeResponse(BaseModel):
    user_id: str
    role: str
    name: str
    email: Optional[str] = None
    unique_id: Optional[str] = None
    emp_id: Optional[str] = None
    track_id: Optional[str] = None


class MessageResponse(BaseModel):
    message: str
