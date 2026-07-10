from fastapi import APIRouter, Depends
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.mentor_assignment import MentorAssignment
from app.models.worklog import Worklog
from app.models.evaluation import Evaluation

router = APIRouter()


@router.get("/dashboard")
async def mentor_dashboard(mentor: User = Depends(require_role("mentor"))):
    mid = str(mentor.id)
    assignments = await MentorAssignment.find(MentorAssignment.mentor_id == mid, MentorAssignment.is_active == True).to_list()
    total_trainees = sum(a.end_idx - a.start_idx + 1 for a in assignments)
    pending_wl = await Worklog.find(Worklog.mentor_id == mid, Worklog.status == "pending").count()
    pending_ev = await Evaluation.find(Evaluation.mentor_id == mid, Evaluation.status == "pending").count()
    return {"mentor_name": mentor.profile.name, "assigned_trainees": total_trainees,
            "pending_worklogs": pending_wl, "pending_evaluations": pending_ev}
