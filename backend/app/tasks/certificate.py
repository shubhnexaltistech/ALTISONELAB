from app.celery_app import celery_app


@celery_app.task
def generate_certificate(trainee_id: str, name: str, track_name: str):
    print(f"[CERT] Generating certificate for {name}")
