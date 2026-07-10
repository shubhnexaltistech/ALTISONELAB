from beanie import Document
from typing import Optional
from datetime import datetime


class Track(Document):
    name: str
    code: str
    slug: Optional[str] = None
    description: Optional[str] = None
    fee_inr: Optional[int] = None
    duration: Optional[str] = None
    highlights: Optional[str] = None
    outcomes: Optional[str] = None
    is_active: bool = True
    module_count: int = 0
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "tracks"
