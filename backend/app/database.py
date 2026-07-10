from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app.models.user import User
from app.models.application import Application
from app.models.track import Track
from app.models.module import Module
from app.models.trainee_progress import TraineeProgress
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.worklog import Worklog
from app.models.evaluation import Evaluation
from app.models.mentor_assignment import MentorAssignment
from app.models.announcement import Announcement
from app.models.payment import Payment
from app.models.audit_log import AuditLog
from app.models.assignment import Assignment
from app.models.submission import Submission
from app.models.settings import SiteSettings

_motor_client: AsyncIOMotorClient | None = None


def get_motor_client() -> AsyncIOMotorClient:
    global _motor_client
    if _motor_client is None:
        _motor_client = AsyncIOMotorClient(settings.MONGO_URI)
    return _motor_client


async def init_db():
    client = get_motor_client()
    await init_beanie(
        database=client[settings.MONGO_DB_NAME],
        document_models=[
            User, Application, Track, Module, TraineeProgress,
            Quiz, QuizAttempt, Worklog, Evaluation,
            MentorAssignment, Announcement, Payment, AuditLog,
            Assignment, Submission, SiteSettings,
        ],
    )
