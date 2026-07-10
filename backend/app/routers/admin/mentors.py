from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.routers.auth_deps import require_role
from app.models.user import User, UserProfile
from app.models.mentor_assignment import MentorAssignment
from app.utils.security import hash_password
from pydantic import BaseModel, EmailStr

router = APIRouter()


class MentorCreateRequest(BaseModel):
    name: str
    email: EmailStr
    emp_id: str
    phone: Optional[str] = None


class MentorAssignRequest(BaseModel):
    mentor_id: str
    track_id: str
    start_idx: int
    end_idx: int


@router.get("")
async def list_mentors(admin=Depends(require_role("admin"))):
    mentors = await User.find(User.role == "mentor").to_list()
    result = []
    for m in mentors:
        assignments = await MentorAssignment.find(MentorAssignment.mentor_id == str(m.id), MentorAssignment.is_active == True).to_list()
        result.append({"id": str(m.id), "name": m.profile.name, "email": m.email,
                       "emp_id": m.emp_id, "is_active": m.is_active,
                       "assignments": [{"track_id": a.track_id, "start_idx": a.start_idx, "end_idx": a.end_idx} for a in assignments]})
    return result


@router.post("", status_code=201)
async def create_mentor(body: MentorCreateRequest, admin=Depends(require_role("admin"))):
    if await User.find_one(User.emp_id == body.emp_id):
        raise HTTPException(status_code=400, detail="Employee ID exists")
    mentor = User(role="mentor", email=body.email, emp_id=body.emp_id,
                  hashed_password=hash_password(body.emp_id),
                  profile=UserProfile(name=body.name, phone=body.phone))
    await mentor.insert()
    return {"id": str(mentor.id), "message": "Mentor created"}


@router.post("/assign", status_code=201)
async def assign_mentor(body: MentorAssignRequest, admin=Depends(require_role("admin"))):
    assignment = MentorAssignment(mentor_id=body.mentor_id, track_id=body.track_id,
                                   start_idx=body.start_idx, end_idx=body.end_idx)
    await assignment.insert()
    return {"id": str(assignment.id), "message": "Assigned"}
