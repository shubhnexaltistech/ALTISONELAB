"""Create the first admin user. Run: python create_admin.py [--email EMAIL] [--password PASSWORD]"""
import argparse
import asyncio
import sys
from app.database import init_db
from app.models.user import User, UserProfile
from app.utils.security import hash_password
from app.config import settings


async def main(email: str, password: str, force: bool):
    await init_db()
    existing = await User.find_one(User.role == "admin")
    if existing and not force:
        print(f"Admin already exists: {existing.email}")
        print("Use --force to create another admin.")
        return
    if settings.APP_ENV == "production" and password in ("changeme123", "admin", "password"):
        print("Refusing weak password in production.")
        sys.exit(1)
    if await User.find_one(User.email == email):
        print(f"User with email {email} already exists.")
        sys.exit(1)
    admin = User(
        role="admin",
        email=email,
        hashed_password=hash_password(password),
        profile=UserProfile(name="Admin"),
    )
    await admin.insert()
    print(f"Admin created: {email}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create AltisOne ITP admin user")
    parser.add_argument("--email", default="admin@altisonelabz.com")
    parser.add_argument("--password", default="changeme123")
    parser.add_argument("--force", action="store_true", help="Create even if admin exists")
    args = parser.parse_args()
    asyncio.run(main(args.email, args.password, args.force))
