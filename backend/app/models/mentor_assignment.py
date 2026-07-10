from beanie import Document
from datetime import datetime


class MentorAssignment(Document):
    mentor_id: str
    track_id: str
    start_idx: int
    end_idx: int
    is_active: bool = True
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "mentor_assignments"
        indexes = [
            [("mentor_id", 1), ("is_active", 1)],
            [("track_id", 1)],
        ]
