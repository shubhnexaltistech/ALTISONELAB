from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date


class WorklogCreate(BaseModel):
    date: date
    content: str
    hours_worked: float = 0


class WorklogResponse(BaseModel):
    id: str
    date: str
    content: str
    hours_worked: float
    status: Literal["pending", "approved", "rejected"]
    mentor_note: Optional[str] = None


class WorklogListResponse(BaseModel):
    data: list[WorklogResponse]
    total: int


class WorklogReviewRequest(BaseModel):
    status: Literal["approved", "rejected"]
    mentor_note: Optional[str] = None
