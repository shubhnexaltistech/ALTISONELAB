from datetime import datetime, timezone
from fastapi import HTTPException, Request, Response
from app.models.user import User
from app.schemas.auth import LoginResponse, RefreshResponse, MessageResponse
from app.utils.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    create_reset_token,
    hash_password,
)
from app.config import settings
from app.tasks.email import send_password_reset_email
import hashlib


async def authenticate_user(identifier: str, password: str) -> User:
    user = await User.find_one({"email": identifier})
    if not user:
        user = await User.find_one({"unique_id": identifier})
    if not user:
        user = await User.find_one({"emp_id": identifier})
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    return user


async def login_user(
    request: Request, response: Response, identifier: str, password: str
) -> LoginResponse:
    user = await authenticate_user(identifier, password)
    user_id = str(user.id)
    access_token = create_access_token(user_id, user.role)
    refresh_token = create_refresh_token(user_id, user.role)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.APP_ENV != "development",
        samesite="strict",
        max_age=settings.JWT_REFRESH_EXPIRE_DAYS * 86400,
        path="/api/v1/auth",
    )
    user.last_login = datetime.now(timezone.utc)
    await user.save()
    return LoginResponse(access_token=access_token, role=user.role, user_id=user_id)


async def refresh_access_token(request: Request) -> RefreshResponse:
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    redis = request.app.state.redis
    if await redis.get(f"blacklist:{token}"):
        raise HTTPException(status_code=401, detail="Token revoked")
    payload = decode_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = await User.get(payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    new_access = create_access_token(str(user.id), user.role)
    return RefreshResponse(access_token=new_access)


async def logout_user(request: Request, response: Response) -> MessageResponse:
    redis = request.app.state.redis
    refresh = request.cookies.get("refresh_token")
    if refresh:
        await redis.set(
            f"blacklist:{refresh}", "1", ex=settings.JWT_REFRESH_EXPIRE_DAYS * 86400
        )
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        access = auth_header[7:]
        await redis.set(
            f"blacklist:{access}", "1", ex=settings.JWT_ACCESS_EXPIRE_MINUTES * 60
        )
    response.delete_cookie("refresh_token", path="/api/v1/auth")
    return MessageResponse(message="Logged out")


async def request_password_reset(email: str) -> MessageResponse:
    user = await User.find_one({"email": email})
    if user:
        reset_token = create_reset_token(str(user.id))
        send_password_reset_email.delay(email, user.profile.name, reset_token)
    return MessageResponse(message="If the email exists, a reset link has been sent")


async def reset_password(request: Request, token: str, new_password: str) -> MessageResponse:
    redis = request.app.state.redis
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    if await redis.get(f"reset_used:{token_hash}"):
        raise HTTPException(status_code=400, detail="Reset token already used")
    payload = decode_token(token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user = await User.get(payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(new_password)
    await user.save()
    await redis.set(f"reset_used:{token_hash}", "1", ex=3600)
    return MessageResponse(message="Password reset successful")
