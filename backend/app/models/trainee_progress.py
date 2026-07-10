from beanie import Document
from typing import Optional
from datetime import datetime


class TraineeProgress(Document):
    user_id: str
    module_id: str
    is_unlocked: bool = False
    quiz_passed: bool = False
    completed_at: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "trainee_progress"
        indexes = [
            [("user_id", 1), ("module_id", 1)],
        ]
