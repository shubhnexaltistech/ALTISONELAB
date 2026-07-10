from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.services.quiz_service import start_quiz, submit_quiz
from pydantic import BaseModel

router = APIRouter()


class SubmitAnswer(BaseModel):
    question_id: str
    selected_options: List[int]


class SubmitRequest(BaseModel):
    attempt_id: str
    answers: List[SubmitAnswer]


@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str, trainee: User = Depends(require_role("trainee"))):
    quiz = await Quiz.get(quiz_id)
    if not quiz or not quiz.is_active:
        raise HTTPException(status_code=404, detail="Not found")
    questions = [{"id": q.id, "text": q.text, "type": q.type,
                  "options": [{"text": o.text} for o in q.options], "points": q.points} for q in quiz.questions]
    return {"id": str(quiz.id), "title": quiz.title, "time_limit_mins": quiz.time_limit_mins,
            "passing_score": quiz.passing_score, "questions": questions}


@router.post("/{quiz_id}/start")
async def start(quiz_id: str, trainee: User = Depends(require_role("trainee"))):
    attempt = await start_quiz(str(trainee.id), quiz_id)
    return {"attempt_id": str(attempt.id), "status": attempt.status, "started_at": attempt.started_at}


@router.post("/{quiz_id}/submit")
async def submit(quiz_id: str, body: SubmitRequest, trainee: User = Depends(require_role("trainee"))):
    answers = [{"question_id": a.question_id, "selected_options": a.selected_options} for a in body.answers]
    attempt = await submit_quiz(str(trainee.id), body.attempt_id, answers)
    return {"attempt_id": str(attempt.id), "status": attempt.status, "score": attempt.score, "passed": attempt.status == "passed"}


@router.get("/{quiz_id}/history")
async def history(quiz_id: str, trainee: User = Depends(require_role("trainee"))):
    attempts = await QuizAttempt.find(QuizAttempt.user_id == str(trainee.id), QuizAttempt.quiz_id == quiz_id).sort(-QuizAttempt.started_at).to_list()
    return [{"id": str(a.id), "status": a.status, "score": a.score, "started_at": a.started_at} for a in attempts]
