from beanie import Document
from typing import List, Optional
from datetime import datetime


class Announcement(Document):
    title: str
    body: str
    target_tracks: List[str] = []
    created_by: str
    is_active: bool = True
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "announcements"
        indexes = [[("is_active", 1), ("created_at", -1)]]
