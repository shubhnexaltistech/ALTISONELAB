from beanie import Document
from typing import Optional, Literal
from datetime import datetime, date


class Worklog(Document):
    user_id: str
    mentor_id: Optional[str] = None
    date: date
    content: str
    hours_worked: float = 0
    status: Literal["pending", "approved", "rejected"] = "pending"
    mentor_note: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "worklogs"
        indexes = [
            [("user_id", 1), ("date", -1)],
            [("status", 1), ("mentor_id", 1)],
        ]
