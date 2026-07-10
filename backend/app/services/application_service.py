from datetime import datetime, timezone
from app.models.application import Application
from app.models.track import Track
from app.models.user import User, UserProfile
from app.models.module import Module
from app.models.trainee_progress import TraineeProgress
from app.utils.unique_id import generate_unique_id
from app.utils.security import hash_password
from app.tasks.email import send_welcome_email


async def verify_application(application_id: str) -> User:
    application = await Application.get(application_id)
    if not application:
        raise ValueError("Application not found")
    if application.status != "paid":
        raise ValueError(f"Cannot verify: status is {application.status}")
    existing_user = await User.find_one(User.email == application.email)
    if existing_user:
        raise ValueError("User with this email already exists")
    track = await Track.get(application.track_id)
    if not track:
        raise ValueError("Track not found")
    verified_count = await Application.find(
        Application.track_id == application.track_id,
        Application.status == "verified",
    ).count()
    unique_id = generate_unique_id(
        track_code=track.code,
        application_number=verified_count + 1,
        created_at=application.created_at,
    )
    user = User(
        role="trainee",
        email=application.email,
        unique_id=unique_id,
        hashed_password=hash_password(unique_id),
        profile=UserProfile(
            name=application.applicant_name,
            phone=application.phone,
            college=application.college,
            city=application.city,
        ),
        track_id=application.track_id,
        application_id=str(application.id),
    )
    await user.insert()
    module_1 = await Module.find_one(
        Module.track_id == application.track_id,
        Module.order == 1,
    )
    if module_1:
        await TraineeProgress(
            user_id=str(user.id),
            module_id=str(module_1.id),
            is_unlocked=True,
        ).insert()
    application.status = "verified"
    application.unique_id = unique_id
    application.updated_at = datetime.now(timezone.utc)
    await application.save()
    send_welcome_email.delay(application.email, application.applicant_name, unique_id)
    return user
