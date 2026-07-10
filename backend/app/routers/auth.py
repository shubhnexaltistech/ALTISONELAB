from fastapi import APIRouter, Request, Response, Depends
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
    MeResponse,
)
from app.routers.auth_deps import get_current_user
from app.models.user import User
from app.services import auth_service
from app.middleware.rate_limit import limiter

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(request: Request, response: Response, body: LoginRequest):
    return await auth_service.login_user(request, response, body.identifier, body.password)


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_token(request: Request):
    return await auth_service.refresh_access_token(request)


@router.post("/logout", response_model=MessageResponse)
async def logout(request: Request, response: Response):
    return await auth_service.logout_user(request, response)


@router.get("/me", response_model=MeResponse)
async def get_me(user: User = Depends(get_current_user)):
    return MeResponse(
        user_id=str(user.id),
        role=user.role,
        name=user.profile.name,
        email=user.email,
        unique_id=user.unique_id,
        emp_id=user.emp_id,
        track_id=user.track_id,
    )


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest):
    return await auth_service.request_password_reset(body.email)


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def reset_password(request: Request, body: ResetPasswordRequest):
    return await auth_service.reset_password(request, body.token, body.new_password)
