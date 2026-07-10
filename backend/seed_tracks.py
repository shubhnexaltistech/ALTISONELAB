"""Seed default internship tracks. Run: python seed_tracks.py"""
import asyncio
from app.database import init_db
from app.models.track import Track

DEFAULT_TRACKS = [
    {
        "name": "Full Stack Web Development",
        "code": "FS",
        "slug": "full-stack",
        "description": "Build production-ready web apps with React, Node.js, REST APIs, databases, and cloud deployment.",
        "fee_inr": 4999,
        "duration": "16 weeks · 4 months",
        "highlights": "React 18 & TypeScript\nNode.js & Express\nMongoDB & PostgreSQL\nGit, CI/CD & deployment",
        "outcomes": "Ship a full-stack capstone project\nBuild portfolio-ready applications\nInterview prep for SDE roles",
    },
    {
        "name": "Python & AI / Machine Learning",
        "code": "DS",
        "slug": "ai-ml",
        "description": "Learn Python, data analysis, ML fundamentals, and deploy intelligent applications with modern AI tools.",
        "fee_inr": 5999,
        "duration": "16 weeks · 4 months",
        "highlights": "Python, pandas & NumPy\nScikit-learn & model training\nData visualization\nLLM integration basics",
        "outcomes": "Train and evaluate ML models\nBuild data-driven dashboards\nPresent a Kaggle-style capstone",
    },
    {
        "name": "Flutter Mobile Development",
        "code": "FL",
        "slug": "flutter",
        "description": "Create cross-platform iOS and Android apps with Flutter, Dart, Firebase, and app store publishing workflows.",
        "fee_inr": 5499,
        "duration": "14 weeks · 3.5 months",
        "highlights": "Dart & Flutter widgets\nState management\nREST API integration\nFirebase auth & storage",
        "outcomes": "Publish a mobile app prototype\nMaster responsive UI patterns\nPrepare for mobile developer roles",
    },
    {
        "name": "Cloud & DevOps Engineering",
        "code": "CD",
        "slug": "devops",
        "description": "Master AWS fundamentals, Docker, Kubernetes basics, CI/CD pipelines, and infrastructure as code.",
        "fee_inr": 6499,
        "duration": "14 weeks · 3.5 months",
        "highlights": "AWS core services\nDocker & containers\nGitHub Actions CI/CD\nMonitoring & logging",
        "outcomes": "Deploy apps to cloud infrastructure\nAutomate build and release pipelines\nEarn DevOps-ready project experience",
    },
    {
        "name": "UI/UX Design",
        "code": "UX",
        "slug": "ui-ux",
        "description": "User research, wireframing, high-fidelity prototyping, design systems, and handoff to development teams.",
        "fee_inr": 4499,
        "duration": "12 weeks · 3 months",
        "highlights": "Figma & design systems\nUser research methods\nAccessibility (WCAG)\nPrototyping & usability testing",
        "outcomes": "Complete a UX case study portfolio\nDesign mobile and web interfaces\nCollaborate with dev teams on handoff",
    },
    {
        "name": "Power BI & Data Analytics",
        "code": "PB",
        "slug": "power-bi",
        "description": "Transform raw data into business insights with Power BI, SQL, Excel, and dashboard storytelling for stakeholders.",
        "fee_inr": 3999,
        "duration": "10 weeks · 2.5 months",
        "highlights": "Power BI Desktop & Service\nSQL for analysts\nDAX measures & KPIs\nExecutive dashboard design",
        "outcomes": "Build interactive BI dashboards\nWrite SQL queries for reporting\nPresent data stories to business users",
    },
    {
        "name": "Cybersecurity Fundamentals",
        "code": "CY",
        "slug": "cybersecurity",
        "description": "Network security, ethical hacking basics, vulnerability assessment, and secure coding practices for modern apps.",
        "fee_inr": 5999,
        "duration": "14 weeks · 3.5 months",
        "highlights": "Network & OS security\nOWASP Top 10\nPenetration testing intro\nSecurity in SDLC",
        "outcomes": "Conduct basic security audits\nUnderstand threat modeling\nPrepare for security analyst pathways",
    },
]


async def main():
    await init_db()
    created = 0
    updated = 0
    for item in DEFAULT_TRACKS:
        existing = await Track.find_one(Track.code == item["code"])
        if existing:
            changed = False
            for key, value in item.items():
                if getattr(existing, key, None) != value:
                    setattr(existing, key, value)
                    changed = True
            if not existing.is_active:
                existing.is_active = True
                changed = True
            if changed:
                await existing.save()
                updated += 1
                print(f"Updated track: {existing.name} ({existing.code})")
            continue
        track = Track(**item)
        await track.insert()
        created += 1
        print(f"Created track: {track.name} ({track.code})")

    total = await Track.find(Track.is_active == True).count()
    print(f"Done. {created} created, {updated} updated. {total} active track(s) total.")


if __name__ == "__main__":
    asyncio.run(main())
