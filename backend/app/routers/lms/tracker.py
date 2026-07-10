from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime
from app.routers.auth_deps import require_role
from app.models.user import User

router = APIRouter()


class TrackerSessionRequest(BaseModel):
    module_id: str | None = None


@router.post("/session")
async def start_session(body: TrackerSessionRequest, trainee: User = Depends(require_role("trainee"))):
    return {
        "session_id": f"sess_{trainee.id}_{int(datetime.utcnow().timestamp())}",
        "module_id": body.module_id,
        "started_at": datetime.utcnow().isoformat(),
    }


@router.post("/heartbeat")
async def heartbeat(trainee: User = Depends(require_role("trainee"))):
    return {"ok": True, "user_id": str(trainee.id), "at": datetime.utcnow().isoformat()}
