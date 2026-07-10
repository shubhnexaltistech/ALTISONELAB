from beanie import Document
from typing import Optional, Literal
from datetime import datetime


class Submission(Document):
    assignment_id: str
    trainee_id: str
    content: Optional[str] = None
    repo_url: Optional[str] = None
    status: Literal["pending", "in_progress", "submitted", "graded"] = "pending"
    mentor_feedback: Optional[str] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "submissions"
        indexes = [[("trainee_id", 1), ("assignment_id", 1)]]
