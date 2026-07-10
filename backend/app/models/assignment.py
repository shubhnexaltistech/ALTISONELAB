from beanie import Document
from typing import Optional
from datetime import datetime


class Assignment(Document):
    module_id: str
    track_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    order: int = 0
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "assignments"
        indexes = [[("track_id", 1), ("module_id", 1)]]
