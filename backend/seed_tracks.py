"""Seed default internship tracks. Run: python seed_tracks.py"""
import asyncio
from app.database import init_db
from app.models.track import Track

DEFAULT_TRACKS = [
    {
        "name": "Full Stack Web Development",
        "code": "FS",
        "description": "React, Node.js, databases, and deployment fundamentals.",
    },
    {
        "name": "Python & Data Science",
        "code": "DS",
        "description": "Python, pandas, machine learning basics, and data visualization.",
    },
    {
        "name": "UI/UX Design",
        "code": "UX",
        "description": "User research, wireframing, prototyping, and design systems.",
    },
    {
        "name": "Cloud & DevOps",
        "code": "CD",
        "description": "AWS, Docker, CI/CD pipelines, and infrastructure automation.",
    },
]


async def main():
    await init_db()
    created = 0
    for item in DEFAULT_TRACKS:
        existing = await Track.find_one(Track.code == item["code"])
        if existing:
            if not existing.is_active:
                existing.is_active = True
                await existing.save()
                print(f"Reactivated track: {existing.name}")
            continue
        track = Track(**item)
        await track.insert()
        created += 1
        print(f"Created track: {track.name} ({track.code})")

    total = await Track.find(Track.is_active == True).count()
    if created == 0:
        print(f"No new tracks created. {total} active track(s) in database.")
    else:
        print(f"Seeded {created} track(s). {total} active track(s) total.")


if __name__ == "__main__":
    asyncio.run(main())
