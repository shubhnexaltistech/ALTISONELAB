from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.assignment import Assignment
from app.models.submission import Submission
from app.models.module import Module

router = APIRouter()


class SubmissionCreate(BaseModel):
    assignment_id: str
    content: Optional[str] = None
    repo_url: Optional[str] = None


@router.get("")
async def list_assignments(trainee: User = Depends(require_role("trainee"))):
    if not trainee.track_id:
        return {"data": [], "stats": {"upcoming": 0, "feedback": 0, "score_pct": 0}}
    assignments = await Assignment.find(Assignment.track_id == trainee.track_id).sort(+Assignment.order).to_list()
    submissions = await Submission.find(Submission.trainee_id == str(trainee.id)).to_list()
    sub_by_assignment = {s.assignment_id: s for s in submissions}

    rows = []
    for a in assignments:
        module = await Module.get(a.module_id)
        sub = sub_by_assignment.get(str(a.id))
        status = sub.status if sub else "pending"
        rows.append({
            "id": str(a.id),
            "module_id": a.module_id,
            "module_title": module.title if module else None,
            "title": a.title,
            "description": a.description,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "status": status,
            "mentor_feedback": sub.mentor_feedback if sub else None,
            "submission_id": str(sub.id) if sub else None,
        })

    graded = sum(1 for s in submissions if s.status == "graded")
    upcoming = sum(1 for r in rows if r["status"] in ("pending", "in_progress"))
    return {
        "data": rows,
        "stats": {
            "upcoming": upcoming,
            "feedback": graded,
            "score_pct": min(100, graded * 8) if graded else 0,
        },
    }


@router.get("/submissions")
async def list_submissions(trainee: User = Depends(require_role("trainee"))):
    subs = await Submission.find(Submission.trainee_id == str(trainee.id)).sort(-Submission.updated_at).to_list()
    result = []
    for s in subs:
        assignment = await Assignment.get(s.assignment_id)
        result.append({
            "id": str(s.id),
            "assignment_id": s.assignment_id,
            "assignment_title": assignment.title if assignment else None,
            "content": s.content,
            "repo_url": s.repo_url,
            "status": s.status,
            "mentor_feedback": s.mentor_feedback,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
        })
    return {"data": result, "total": len(result)}


@router.post("/submissions", status_code=201)
async def create_submission(body: SubmissionCreate, trainee: User = Depends(require_role("trainee"))):
    assignment = await Assignment.get(body.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    existing = await Submission.find_one(
        Submission.assignment_id == body.assignment_id,
        Submission.trainee_id == str(trainee.id),
    )
    now = datetime.utcnow()
    if existing:
        existing.content = body.content
        existing.repo_url = body.repo_url
        existing.status = "submitted"
        existing.submitted_at = now
        existing.updated_at = now
        await existing.save()
        return {"id": str(existing.id), "message": "Submission updated"}
    sub = Submission(
        assignment_id=body.assignment_id,
        trainee_id=str(trainee.id),
        content=body.content,
        repo_url=body.repo_url,
        status="submitted",
        submitted_at=now,
    )
    await sub.insert()
    return {"id": str(sub.id), "message": "Submission created"}
