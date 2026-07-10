from fastapi import APIRouter, Depends
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.mentor_assignment import MentorAssignment
from app.models.trainee_progress import TraineeProgress
from app.models.module import Module

router = APIRouter()


@router.get("")
async def list_trainees(mentor: User = Depends(require_role("mentor"))):
    mid = str(mentor.id)
    assignments = await MentorAssignment.find(MentorAssignment.mentor_id == mid, MentorAssignment.is_active == True).to_list()
    result = []
    for a in assignments:
        trainees = await User.find(User.role == "trainee", User.track_id == a.track_id, User.is_active == True).sort(User.created_at).to_list()
        sliced = trainees[a.start_idx:a.end_idx + 1]
        for t in sliced:
            tid = str(t.id)
            total = await Module.find(Module.track_id == t.track_id).count()
            done = await TraineeProgress.find(TraineeProgress.user_id == tid, TraineeProgress.quiz_passed == True).count()
            result.append({"id": tid, "name": t.profile.name, "unique_id": t.unique_id,
                           "progress": {"completed": done, "total": total, "percentage": round((done/total*100) if total else 0, 1)}})
    return result
