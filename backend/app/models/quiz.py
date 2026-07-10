from beanie import Document
from pydantic import BaseModel
from typing import List, Literal, Optional
from datetime import datetime


class QuizOption(BaseModel):
    text: str
    is_correct: bool = False


class QuizQuestion(BaseModel):
    id: str
    text: str
    type: Literal["mcq", "multi_select"] = "mcq"
    options: List[QuizOption]
    points: int = 1


class Quiz(Document):
    module_id: str
    title: str
    passing_score: int = 70
    cooldown_mins: int = 30
    time_limit_mins: int = 20
    questions: List[QuizQuestion] = []
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "quizzes"
        indexes = [[("module_id", 1)]]
