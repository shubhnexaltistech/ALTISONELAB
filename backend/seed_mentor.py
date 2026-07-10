"""Create a dev mentor user for local testing. Run: python seed_mentor.py"""
import asyncio
import sys
from app.database import init_db
from app.models.track import Track
from app.models.user import User, UserProfile
from app.models.mentor_assignment import MentorAssignment
from app.utils.security import hash_password
from app.config import settings


async def main():
    await init_db()
    existing = await User.find_one(User.email == "mentor@altisonelabz.com")
    if existing:
        print(f"Mentor already exists: {existing.email}")
        print(f"Employee ID: {existing.emp_id}")
        print("Password: changeme123")
        return

    track = await Track.find_one(Track.is_active == True)
    if not track:
        print("No active tracks found. Run: python seed_tracks.py")
        sys.exit(1)

    if settings.APP_ENV == "production":
        print("Refusing to seed dev mentor in production.")
        sys.exit(1)

    mentor = User(
        role="mentor",
        email="mentor@altisonelabz.com",
        emp_id="MENTOR001",
        hashed_password=hash_password("changeme123"),
        profile=UserProfile(
            name="Test Mentor",
            phone="9876543211",
        ),
    )
    await mentor.insert()

    assignment = await MentorAssignment.find_one(
        MentorAssignment.mentor_id == str(mentor.id),
        MentorAssignment.track_id == str(track.id),
    )
    if not assignment:
        await MentorAssignment(
            mentor_id=str(mentor.id),
            track_id=str(track.id),
            start_idx=1,
            end_idx=100,
        ).insert()

    print("Mentor created for local testing:")
    print("  Portal: http://localhost:3003")
    print("  Email:  mentor@altisonelabz.com")
    print("  Employee ID (also works as login): MENTOR001")
    print("  Password: changeme123")


if __name__ == "__main__":
    asyncio.run(main())
