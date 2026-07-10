from beanie import Document
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class EvaluationScores(BaseModel):
    code_quality: float = 0
    logic: float = 0
    execution: float = 0
    documentation: float = 0


class Evaluation(Document):
    trainee_id: str
    mentor_id: str
    module_id: str
    status: Literal["none", "pending", "in_review", "graded"] = "none"
    github_url: Optional[str] = None
    scores: Optional[EvaluationScores] = None
    final_score: Optional[float] = None
    mentor_feedback: Optional[str] = None
    submitted_at: Optional[datetime] = None
    graded_at: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "evaluations"
        indexes = [
            [("trainee_id", 1), ("module_id", 1)],
            [("mentor_id", 1), ("status", 1)],
        ]
