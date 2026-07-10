from fastapi import APIRouter, Depends
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.evaluation import Evaluation

router = APIRouter()


@router.get("")
async def list_evaluations(trainee: User = Depends(require_role("trainee"))):
    evals = await Evaluation.find(Evaluation.trainee_id == str(trainee.id)).sort(-Evaluation.created_at).to_list()
    return [{"id": str(e.id), "module_id": e.module_id, "status": e.status,
             "scores": e.scores.model_dump() if e.scores else None, "final_score": e.final_score} for e in evals]
