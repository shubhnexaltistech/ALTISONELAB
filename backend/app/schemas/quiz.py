from pydantic import BaseModel
from typing import List, Literal, Optional
from datetime import datetime


class QuizOptionPublic(BaseModel):
    text: str


class QuizQuestionPublic(BaseModel):
    id: str
    text: str
    type: Literal["mcq", "multi_select"]
    options: List[QuizOptionPublic]
    points: int


class QuizPublicResponse(BaseModel):
    id: str
    title: str
    time_limit_mins: int
    passing_score: int
    questions: List[QuizQuestionPublic]


class SubmitAnswer(BaseModel):
    question_id: str
    selected_options: List[int]


class QuizSubmitRequest(BaseModel):
    attempt_id: str
    answers: List[SubmitAnswer]


class QuizStartResponse(BaseModel):
    attempt_id: str
    status: str
    started_at: datetime


class QuizSubmitResponse(BaseModel):
    attempt_id: str
    status: str
    score: Optional[float]
    passed: bool


class QuizAttemptHistory(BaseModel):
    id: str
    status: str
    score: Optional[float]
    started_at: datetime
