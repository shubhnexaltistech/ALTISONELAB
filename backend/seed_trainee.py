"""Create a dev trainee user for local testing. Run: python seed_trainee.py"""
import asyncio
import sys
from app.database import init_db
from app.models.track import Track
from app.models.user import User, UserProfile
from app.utils.security import hash_password
from app.config import settings


async def main():
    await init_db()
    existing = await User.find_one(User.email == "trainee@altisonelabz.com")
    if existing:
        print(f"Trainee already exists: {existing.email}")
        print(f"Unique ID: {existing.unique_id}")
        print("Password: changeme123")
        return

    track = await Track.find_one(Track.is_active == True)
    if not track:
        print("No active tracks found. Run: python seed_tracks.py")
        sys.exit(1)

    if settings.APP_ENV == "production":
        print("Refusing to seed dev trainee in production.")
        sys.exit(1)

    trainee = User(
        role="trainee",
        email="trainee@altisonelabz.com",
        unique_id="A1FS26010001",
        hashed_password=hash_password("changeme123"),
        profile=UserProfile(
            name="Test Trainee",
            phone="9876543210",
            college="Demo College",
            city="Demo City",
        ),
        track_id=str(track.id),
    )
    await trainee.insert()
    print("Trainee created for local testing:")
    print("  Portal: http://localhost:3002")
    print("  Email:  trainee@altisonelabz.com")
    print("  Unique ID (also works as login): A1FS26010001")
    print("  Password: changeme123")


if __name__ == "__main__":
    asyncio.run(main())
