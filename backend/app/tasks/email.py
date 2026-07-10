import asyncio
from app.celery_app import celery_app
from app.utils.mail import send_email
from app.config import settings


def _run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task
def send_welcome_email(email: str, name: str, unique_id: str):
    body = f"""
    <h2>Welcome to AltisOne ITP, {name}!</h2>
    <p>Your trainee ID is: <strong>{unique_id}</strong></p>
    <p>Login at: <a href="{settings.FRONTEND_LMS_URL}">{settings.FRONTEND_LMS_URL}</a></p>
    <p>Your default password is your trainee ID. Please change it after first login.</p>
    """
    _run_async(send_email(email, "Welcome to AltisOne ITP", body))


@celery_app.task
def send_password_reset_email(email: str, name: str, reset_token: str):
    reset_url = f"{settings.FRONTEND_LMS_URL}/reset-password?token={reset_token}"
    body = f"""
    <h2>Password Reset</h2>
    <p>Hi {name},</p>
    <p><a href="{reset_url}">Click here to reset your password</a></p>
    <p>This link expires in 1 hour.</p>
    """
    _run_async(send_email(email, "Password Reset - AltisOne ITP", body))


@celery_app.task
def send_worklog_approved_email(email: str, name: str, date: str):
    body = f"""
    <h2>Worklog Approved</h2>
    <p>Hi {name}, your worklog for {date} has been approved by your mentor.</p>
    """
    _run_async(send_email(email, "Worklog Approved - AltisOne ITP", body))


@celery_app.task
def send_evaluation_graded_email(email: str, name: str, score: float):
    body = f"""
    <h2>Evaluation Graded</h2>
    <p>Hi {name}, your module evaluation has been graded.</p>
    <p>Final score: <strong>{score}/100</strong></p>
    """
    _run_async(send_email(email, "Evaluation Graded - AltisOne ITP", body))
