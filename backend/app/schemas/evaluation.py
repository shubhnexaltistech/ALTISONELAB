from pydantic import BaseModel, Field
from typing import Optional, Literal


class EvaluationScoresInput(BaseModel):
    code_quality: float = Field(ge=0, le=10)
    logic: float = Field(ge=0, le=10)
    execution: float = Field(ge=0, le=10)
    documentation: float = Field(ge=0, le=10)


class EvaluationScoresResponse(BaseModel):
    code_quality: float
    logic: float
    execution: float
    documentation: float


class EvaluationDraftRequest(BaseModel):
    scores: EvaluationScoresInput
    feedback: Optional[str] = None


class EvaluationResponse(BaseModel):
    id: str
    module_id: str
    status: Literal["none", "pending", "in_review", "graded"]
    scores: Optional[EvaluationScoresResponse] = None
    final_score: Optional[float] = None
    github_url: Optional[str] = None
