from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.evaluation import Evaluation
from app.utils.security import hash_password, verify_password
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter()


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    github_url: Optional[str] = None


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class SubmitGithub(BaseModel):
    module_id: str
    github_url: str


@router.get("")
async def get_profile(trainee: User = Depends(require_role("trainee"))):
    return {"id": str(trainee.id), "unique_id": trainee.unique_id, "email": trainee.email, "profile": trainee.profile.model_dump()}


@router.put("")
async def update_profile(body: ProfileUpdate, trainee: User = Depends(require_role("trainee"))):
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(trainee.profile, k, v)
    await trainee.save()
    return {"message": "Updated"}


@router.put("/password")
async def change_password(body: ChangePassword, trainee: User = Depends(require_role("trainee"))):
    if not verify_password(body.current_password, trainee.hashed_password):
        raise HTTPException(status_code=400, detail="Wrong password")
    trainee.hashed_password = hash_password(body.new_password)
    await trainee.save()
    return {"message": "Password changed"}


@router.post("/submit-github")
async def submit_github(body: SubmitGithub, trainee: User = Depends(require_role("trainee"))):
    uid = str(trainee.id)
    existing = await Evaluation.find_one(Evaluation.trainee_id == uid, Evaluation.module_id == body.module_id)
    if existing and existing.status in ["in_review", "graded"]:
        raise HTTPException(status_code=400, detail="Already submitted")
    if existing:
        existing.github_url = body.github_url
        existing.status = "pending"
        existing.submitted_at = datetime.now(timezone.utc)
        await existing.save()
    else:
        from app.services.mentor_service import resolve_mentor_for_trainee
        mentor_id = await resolve_mentor_for_trainee(trainee) or ""
        ev = Evaluation(
            trainee_id=uid,
            mentor_id=mentor_id,
            module_id=body.module_id,
            status="pending",
            github_url=body.github_url,
            submitted_at=datetime.now(timezone.utc),
        )
        await ev.insert()
    return {"message": "Submitted for review"}
