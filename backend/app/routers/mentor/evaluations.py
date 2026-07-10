from fastapi import APIRouter, Depends
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.evaluation import Evaluation
from app.services.evaluation_service import save_evaluation_draft, submit_evaluation
from app.schemas.evaluation import EvaluationDraftRequest

router = APIRouter()


@router.get("")
async def list_evaluations(mentor: User = Depends(require_role("mentor"))):
    evals = await Evaluation.find(
        Evaluation.mentor_id == str(mentor.id)
    ).sort(-Evaluation.created_at).to_list()
    result = []
    for e in evals:
        t = await User.get(e.trainee_id)
        result.append({
            "id": str(e.id),
            "trainee_name": t.profile.name if t else "?",
            "module_id": e.module_id,
            "status": e.status,
            "github_url": e.github_url,
            "final_score": e.final_score,
        })
    return result


@router.put("/{eval_id}/draft")
async def save_draft(
    eval_id: str,
    body: EvaluationDraftRequest,
    mentor: User = Depends(require_role("mentor")),
):
    ev = await save_evaluation_draft(
        eval_id, str(mentor.id), body.scores.model_dump(), body.feedback
    )
    return {"message": "Draft saved", "status": ev.status}


@router.put("/{eval_id}/submit")
async def submit(eval_id: str, mentor: User = Depends(require_role("mentor"))):
    ev = await submit_evaluation(eval_id, str(mentor.id))
    return {"message": "Submitted", "final_score": ev.final_score}
