from pydantic import BaseModel
from typing import Optional


class TrackCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class TrackResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool
    module_count: int = 0


class PublicTrackResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
