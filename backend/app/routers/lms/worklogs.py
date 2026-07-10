from fastapi import APIRouter, Depends, HTTPException, Query
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.worklog import Worklog
from app.schemas.worklog import WorklogCreate, WorklogListResponse, WorklogResponse
from app.services.mentor_service import resolve_mentor_for_trainee

router = APIRouter()


@router.get("", response_model=WorklogListResponse)
async def list_worklogs(
    trainee: User = Depends(require_role("trainee")),
    page: int = Query(1, ge=1),
):
    uid = str(trainee.id)
    total = await Worklog.find(Worklog.user_id == uid).count()
    worklogs = await Worklog.find(Worklog.user_id == uid).sort(-Worklog.created_at).skip(
        (page - 1) * 20
    ).limit(20).to_list()
    return WorklogListResponse(
        data=[
            WorklogResponse(
                id=str(w.id),
                date=str(w.date),
                content=w.content,
                hours_worked=w.hours_worked,
                status=w.status,
                mentor_note=w.mentor_note,
            )
            for w in worklogs
        ],
        total=total,
    )


@router.post("", status_code=201)
async def create_worklog(
    body: WorklogCreate,
    trainee: User = Depends(require_role("trainee")),
):
    uid = str(trainee.id)
    if await Worklog.find_one(Worklog.user_id == uid, Worklog.date == body.date):
        raise HTTPException(status_code=400, detail="Worklog exists for this date")
    mentor_id = await resolve_mentor_for_trainee(trainee)
    wl = Worklog(
        user_id=uid,
        mentor_id=mentor_id,
        date=body.date,
        content=body.content,
        hours_worked=body.hours_worked,
    )
    await wl.insert()
    return {"id": str(wl.id), "message": "Submitted"}
