from celery import Celery
from app.config import settings

celery_app = Celery(
    "altisone_itp",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    enable_utc=True,
    beat_schedule={
        "daily-backup": {
            "task": "app.tasks.backup.run_backup",
            "schedule": 86400.0,
        },
    },
)

celery_app.autodiscover_tasks(["app.tasks"])
