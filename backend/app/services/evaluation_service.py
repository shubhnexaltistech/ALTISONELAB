from fastapi import HTTPException
from app.models.evaluation import Evaluation, EvaluationScores
from app.models.user import User
from app.tasks.email import send_evaluation_graded_email
from datetime import datetime, timezone


async def save_evaluation_draft(evaluation_id: str, mentor_id: str, scores: dict, feedback: str = None) -> Evaluation:
    ev = await Evaluation.get(evaluation_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Not found")
    if ev.mentor_id != mentor_id:
        raise HTTPException(status_code=403, detail="Not yours")
    if ev.status == "graded":
        raise HTTPException(status_code=400, detail="Already graded")
    ev.scores = EvaluationScores(**scores)
    ev.mentor_feedback = feedback
    ev.status = "in_review"
    await ev.save()
    return ev


async def submit_evaluation(evaluation_id: str, mentor_id: str) -> Evaluation:
    ev = await Evaluation.get(evaluation_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Not found")
    if ev.mentor_id != mentor_id:
        raise HTTPException(status_code=403, detail="Not yours")
    if not ev.scores:
        raise HTTPException(status_code=400, detail="No scores")
    s = ev.scores
    ev.final_score = round((s.code_quality + s.logic + s.execution + s.documentation) * 2.5, 1)
    ev.status = "graded"
    ev.graded_at = datetime.now(timezone.utc)
    await ev.save()
    trainee = await User.get(ev.trainee_id)
    if trainee and trainee.email:
        send_evaluation_graded_email.delay(trainee.email, trainee.profile.name, ev.final_score)
    return ev
