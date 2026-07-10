from fastapi import APIRouter, Depends
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.trainee_progress import TraineeProgress
from app.models.evaluation import Evaluation

router = APIRouter()


@router.get("")
async def get_leaderboard(trainee: User = Depends(require_role("trainee"))):
    trainees = await User.find(User.role == "trainee", User.track_id == trainee.track_id, User.is_active == True).to_list()
    board = []
    for t in trainees:
        tid = str(t.id)
        completed = await TraineeProgress.find(TraineeProgress.user_id == tid, TraineeProgress.quiz_passed == True).count()
        evals = await Evaluation.find(Evaluation.trainee_id == tid, Evaluation.status == "graded").to_list()
        avg = (sum(e.final_score for e in evals if e.final_score) / len(evals)) if evals else 0
        board.append({"user_id": tid, "name": t.profile.name, "modules_completed": completed,
                      "avg_eval_score": round(avg, 1), "composite_score": completed * 10 + avg})
    board.sort(key=lambda x: x["composite_score"], reverse=True)
    for i, e in enumerate(board):
        e["rank"] = i + 1
    return board
