from app.celery_app import celery_app
import subprocess
from datetime import datetime


@celery_app.task
def run_backup():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    print(f"[BACKUP] Running mongodump: {timestamp}")
