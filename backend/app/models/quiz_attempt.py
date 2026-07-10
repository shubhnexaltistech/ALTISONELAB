from beanie import Document
from pydantic import BaseModel
from typing import List, Literal, Optional
from datetime import datetime


class AttemptAnswer(BaseModel):
    question_id: str
    selected_options: List[int]
    is_correct: bool = False
    points_earned: int = 0


class QuizAttempt(Document):
    user_id: str
    quiz_id: str
    module_id: str
    status: Literal["in_progress", "passed", "failed"] = "in_progress"
    score: Optional[float] = None
    answers: List[AttemptAnswer] = []
    started_at: datetime = datetime.utcnow()
    submitted_at: Optional[datetime] = None

    class Settings:
        name = "quiz_attempts"
        indexes = [
            [("user_id", 1), ("quiz_id", 1), ("status", 1)],
            [("user_id", 1), ("started_at", -1)],
        ]
