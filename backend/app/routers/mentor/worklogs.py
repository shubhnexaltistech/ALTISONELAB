from fastapi import APIRouter, Depends, HTTPException, Query, Request
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.worklog import Worklog
from app.schemas.worklog import WorklogReviewRequest
from app.tasks.email import send_worklog_approved_email
from datetime import datetime, timezone

router = APIRouter()


@router.get("")
async def list_worklogs(
    mentor: User = Depends(require_role("mentor")),
    status: str = Query("pending"),
):
    mid = str(mentor.id)
    worklogs = await Worklog.find(
        Worklog.mentor_id == mid,
        Worklog.status == status,
    ).sort(-Worklog.created_at).to_list()
    result = []
    for w in worklogs:
        t = await User.get(w.user_id)
        result.append({
            "id": str(w.id),
            "trainee_name": t.profile.name if t else "?",
            "date": str(w.date),
            "content": w.content,
            "hours_worked": w.hours_worked,
            "status": w.status,
        })
    return {"data": result}


@router.put("/{worklog_id}")
async def review(
    worklog_id: str,
    body: WorklogReviewRequest,
    mentor: User = Depends(require_role("mentor")),
):
    wl = await Worklog.get(worklog_id)
    if not wl:
        raise HTTPException(status_code=404, detail="Not found")
    if wl.mentor_id != str(mentor.id):
        raise HTTPException(status_code=403, detail="Not assigned to you")
    wl.status = body.status
    wl.mentor_note = body.mentor_note
    wl.reviewed_at = datetime.now(timezone.utc)
    await wl.save()
    if body.status == "approved":
        trainee = await User.get(wl.user_id)
        if trainee and trainee.email:
            send_worklog_approved_email.delay(
                trainee.email, trainee.profile.name, str(wl.date)
            )
    return {"message": f"Worklog {body.status}"}
