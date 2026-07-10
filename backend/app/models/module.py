from beanie import Document
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ModuleTask(BaseModel):
    title: str
    description: Optional[str] = None
    order: int


class Module(Document):
    track_id: str
    title: str
    order: int
    description: Optional[str] = None
    tasks: List[ModuleTask] = []
    quiz_id: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "modules"
        indexes = [
            [("track_id", 1), ("order", 1)],
        ]
