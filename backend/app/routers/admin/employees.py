from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.routers.auth_deps import require_role
from app.models.user import User, UserProfile
from app.models.track import Track
from app.models.trainee_progress import TraineeProgress
from app.models.module import Module
from app.utils.security import hash_password

router = APIRouter()


class EmployeeCreateRequest(BaseModel):
    name: str
    email: EmailStr
    unique_id: str
    track_id: str
    phone: Optional[str] = None


@router.get("")
async def list_employees(admin=Depends(require_role("admin"))):
    trainees = await User.find(User.role == "trainee").to_list()
    tracks = {str(t.id): t.name for t in await Track.find_all().to_list()}
    result = []
    for t in trainees:
        uid = str(t.id)
        total = await Module.find(Module.track_id == t.track_id).count() if t.track_id else 0
        completed = await TraineeProgress.find(
            TraineeProgress.user_id == uid, TraineeProgress.quiz_passed == True
        ).count()
        pct = int((completed / total) * 100) if total > 0 else 0
        result.append({
            "id": str(t.id),
            "name": t.profile.name,
            "email": t.email,
            "unique_id": t.unique_id,
            "track_id": t.track_id,
            "track_name": tracks.get(t.track_id or "", ""),
            "is_active": t.is_active,
            "progress_pct": pct,
        })
    return {"data": result, "total": len(result), "active": sum(1 for e in result if e["is_active"])}


@router.post("", status_code=201)
async def create_employee(body: EmployeeCreateRequest, admin=Depends(require_role("admin"))):
    track = await Track.get(body.track_id)
    if not track:
        raise HTTPException(status_code=400, detail="Invalid track")
    if await User.find_one(User.unique_id == body.unique_id):
        raise HTTPException(status_code=400, detail="Unique ID exists")
    trainee = User(
        role="trainee",
        email=body.email,
        unique_id=body.unique_id,
        track_id=body.track_id,
        hashed_password=hash_password(body.unique_id),
        profile=UserProfile(name=body.name, phone=body.phone),
    )
    await trainee.insert()
    return {"id": str(trainee.id), "message": "Employee created"}
