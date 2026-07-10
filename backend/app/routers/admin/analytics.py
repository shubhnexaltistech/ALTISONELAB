from fastapi import APIRouter, Depends
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.application import Application
from app.models.quiz_attempt import QuizAttempt
from app.models.worklog import Worklog
from app.models.evaluation import Evaluation
from app.models.track import Track

router = APIRouter()


@router.get("/analytics")
async def get_analytics(admin=Depends(require_role("admin"))):
    tracks = await Track.find(Track.is_active == True).to_list()
    track_stats = []
    for track in tracks:
        tid = str(track.id)
        trainees = await User.find(User.role == "trainee", User.track_id == tid).count()
        apps = await Application.find(Application.track_id == tid).count()
        track_stats.append({"track_name": track.name, "trainees": trainees, "applications": apps})
    total_attempts = await QuizAttempt.find().count()
    passed = await QuizAttempt.find(QuizAttempt.status == "passed").count()
    pass_rate = (passed / total_attempts * 100) if total_attempts > 0 else 0
    total_worklogs = await Worklog.find().count()
    approved = await Worklog.find(Worklog.status == "approved").count()
    graded = await Evaluation.find(Evaluation.status == "graded").count()
    return {
        "tracks": track_stats,
        "quizzes": {"total_attempts": total_attempts, "passed": passed, "pass_rate": round(pass_rate, 1)},
        "worklogs": {"total": total_worklogs, "approved": approved},
        "evaluations": {"graded": graded},
    }
