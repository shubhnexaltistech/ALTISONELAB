from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from app.utils.security import decode_token


def user_id_key(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        payload = decode_token(auth[7:])
        if payload and payload.get("sub"):
            return f"user:{payload['sub']}"
    return get_remote_address(request)


limiter = Limiter(key_func=user_id_key, default_limits=["100/minute"])
login_limiter = Limiter(key_func=get_remote_address)
