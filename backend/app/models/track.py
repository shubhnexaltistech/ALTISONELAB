from beanie import Document
from typing import Optional
from datetime import datetime


class Track(Document):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True
    module_count: int = 0
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "tracks"
