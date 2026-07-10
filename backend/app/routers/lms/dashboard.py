from fastapi import APIRouter, Depends
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.trainee_progress import TraineeProgress
from app.models.module import Module
from app.models.worklog import Worklog
from app.models.announcement import Announcement

router = APIRouter()


@router.get("/dashboard")
async def trainee_dashboard(trainee: User = Depends(require_role("trainee"))):
    uid = str(trainee.id)
    total = await Module.find(Module.track_id == trainee.track_id).count()
    completed = await TraineeProgress.find(TraineeProgress.user_id == uid, TraineeProgress.quiz_passed == True).count()
    unlocked = await TraineeProgress.find(TraineeProgress.user_id == uid, TraineeProgress.is_unlocked == True).count()
    worklogs = await Worklog.find(Worklog.user_id == uid).sort(-Worklog.created_at).limit(5).to_list()
    anns = await Announcement.find(Announcement.is_active == True).sort(-Announcement.created_at).limit(5).to_list()
    return {
        "user": {"name": trainee.profile.name, "unique_id": trainee.unique_id},
        "progress": {"total_modules": total, "completed": completed, "unlocked": unlocked,
                     "percentage": round((completed / total * 100) if total > 0 else 0, 1)},
        "recent_worklogs": [{"id": str(w.id), "date": str(w.date), "status": w.status} for w in worklogs],
        "announcements": [{"id": str(a.id), "title": a.title, "body": a.body} for a in anns],
    }
