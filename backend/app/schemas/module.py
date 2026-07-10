from pydantic import BaseModel
from typing import Optional, List


class ModuleTaskResponse(BaseModel):
    title: str
    description: Optional[str] = None
    order: int


class ModuleListItem(BaseModel):
    id: str
    title: str
    order: int
    description: Optional[str] = None
    quiz_id: Optional[str] = None
    is_unlocked: bool
    quiz_passed: bool


class ModuleDetailResponse(BaseModel):
    id: str
    title: str
    order: int
    description: Optional[str] = None
    tasks: List[ModuleTaskResponse]
    quiz_id: Optional[str] = None
