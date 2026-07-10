from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.routers.auth_deps import require_role
from app.models.quiz import Quiz, QuizQuestion, QuizOption
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid

router = APIRouter()


class OptionInput(BaseModel):
    text: str
    is_correct: bool = False


class QuestionInput(BaseModel):
    text: str
    type: str = "mcq"
    options: List[OptionInput]
    points: int = 1


class QuizCreateRequest(BaseModel):
    module_id: str
    title: str
    passing_score: int = 70
    cooldown_mins: int = 30
    time_limit_mins: int = 20
    questions: List[QuestionInput] = []


@router.get("")
async def list_quizzes(admin=Depends(require_role("admin"))):
    quizzes = await Quiz.find().sort(-Quiz.created_at).to_list()
    return [{"id": str(q.id), "module_id": q.module_id, "title": q.title,
             "passing_score": q.passing_score, "question_count": len(q.questions),
             "is_active": q.is_active} for q in quizzes]


@router.post("", status_code=201)
async def create_quiz(body: QuizCreateRequest, admin=Depends(require_role("admin"))):
    questions = [QuizQuestion(id=str(uuid.uuid4()), text=q.text, type=q.type,
                 options=[QuizOption(text=o.text, is_correct=o.is_correct) for o in q.options],
                 points=q.points) for q in body.questions]
    quiz = Quiz(module_id=body.module_id, title=body.title, passing_score=body.passing_score,
                cooldown_mins=body.cooldown_mins, time_limit_mins=body.time_limit_mins, questions=questions)
    await quiz.insert()
    from app.models.module import Module
    module = await Module.get(body.module_id)
    if module:
        module.quiz_id = str(quiz.id)
        await module.save()
    return {"id": str(quiz.id), "message": "Quiz created"}


@router.delete("/{quiz_id}")
async def delete_quiz(quiz_id: str, admin=Depends(require_role("admin"))):
    quiz = await Quiz.get(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Not found")
    quiz.is_active = False
    await quiz.save()
    return {"message": "Quiz deactivated"}
