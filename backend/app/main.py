from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.config import settings
from app.database import init_db, get_motor_client
from app.middleware.logging import CorrelationIdMiddleware
from app.middleware.rate_limit import limiter
from app.routers import auth, public, webhooks
from app.routers.admin import (
    dashboard as admin_dashboard,
    applications as admin_applications,
    tracks as admin_tracks,
    modules as admin_modules,
    mentors as admin_mentors,
    quizzes as admin_quizzes,
    announcements as admin_announcements,
    analytics as admin_analytics,
    employees as admin_employees,
    upload as admin_upload,
)
from app.routers.lms import (
    dashboard as lms_dashboard,
    modules as lms_modules,
    quizzes as lms_quizzes,
    worklogs as lms_worklogs,
    profile as lms_profile,
    evaluations as lms_evaluations,
    leaderboard as lms_leaderboard,
    announcements as lms_announcements,
    assignments as lms_assignments,
    tracker as lms_tracker,
)
from app.routers.mentor import (
    dashboard as mentor_dashboard,
    trainees as mentor_trainees,
    worklogs as mentor_worklogs,
    evaluations as mentor_evaluations,
)
from app.utils.redis_client import create_redis_client
import structlog

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    app.state.redis = await create_redis_client()
    logger.info("application_started", env=settings.APP_ENV)
    yield
    await app.state.redis.aclose()
    logger.info("application_shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="3.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(CorrelationIdMiddleware)

    @app.get("/health")
    async def health(request: Request):
        mongo_ok = False
        redis_ok = False
        try:
            client = get_motor_client()
            await client.admin.command("ping")
            mongo_ok = True
        except Exception as exc:
            logger.warning("health_mongo_failed", error=str(exc))
        try:
            redis_ok = await request.app.state.redis.ping()
        except Exception as exc:
            logger.warning("health_redis_failed", error=str(exc))
        status = "healthy" if mongo_ok and redis_ok else "degraded"
        code = 200 if mongo_ok and redis_ok else 503
        return JSONResponse(
            status_code=code,
            content={"status": status, "mongo": mongo_ok, "redis": redis_ok},
        )

    prefix = settings.API_V1_PREFIX

    app.include_router(auth.router, prefix=f"{prefix}/auth", tags=["Auth"])
    app.include_router(public.router, prefix=f"{prefix}/public", tags=["Public"])
    app.include_router(webhooks.router, prefix=f"{prefix}/webhooks", tags=["Webhooks"])

    app.include_router(admin_dashboard.router, prefix=f"{prefix}/admin", tags=["Admin"])
    app.include_router(admin_applications.router, prefix=f"{prefix}/admin/applications", tags=["Admin - Applications"])
    app.include_router(admin_tracks.router, prefix=f"{prefix}/admin/tracks", tags=["Admin - Tracks"])
    app.include_router(admin_modules.router, prefix=f"{prefix}/admin/modules", tags=["Admin - Modules"])
    app.include_router(admin_mentors.router, prefix=f"{prefix}/admin/mentors", tags=["Admin - Mentors"])
    app.include_router(admin_quizzes.router, prefix=f"{prefix}/admin/quizzes", tags=["Admin - Quizzes"])
    app.include_router(admin_announcements.router, prefix=f"{prefix}/admin/announcements", tags=["Admin - Announcements"])
    app.include_router(admin_analytics.router, prefix=f"{prefix}/admin/analytics", tags=["Admin - Analytics"])
    app.include_router(admin_employees.router, prefix=f"{prefix}/admin/employees", tags=["Admin - Employees"])
    app.include_router(admin_upload.router, prefix=f"{prefix}/admin/upload", tags=["Admin - Upload"])

    app.include_router(lms_dashboard.router, prefix=f"{prefix}/lms", tags=["LMS"])
    app.include_router(lms_modules.router, prefix=f"{prefix}/lms/modules", tags=["LMS - Modules"])
    app.include_router(lms_quizzes.router, prefix=f"{prefix}/lms/quizzes", tags=["LMS - Quizzes"])
    app.include_router(lms_worklogs.router, prefix=f"{prefix}/lms/worklogs", tags=["LMS - Worklogs"])
    app.include_router(lms_profile.router, prefix=f"{prefix}/lms/profile", tags=["LMS - Profile"])
    app.include_router(lms_evaluations.router, prefix=f"{prefix}/lms/evaluations", tags=["LMS - Evaluations"])
    app.include_router(lms_leaderboard.router, prefix=f"{prefix}/lms/leaderboard", tags=["LMS - Leaderboard"])
    app.include_router(lms_announcements.router, prefix=f"{prefix}/lms/announcements", tags=["LMS - Announcements"])
    app.include_router(lms_assignments.router, prefix=f"{prefix}/lms/assignments", tags=["LMS - Assignments"])
    app.include_router(lms_tracker.router, prefix=f"{prefix}/lms/tracker", tags=["LMS - Tracker"])

    app.include_router(mentor_dashboard.router, prefix=f"{prefix}/mentor", tags=["Mentor"])
    app.include_router(mentor_trainees.router, prefix=f"{prefix}/mentor/trainees", tags=["Mentor - Trainees"])
    app.include_router(mentor_worklogs.router, prefix=f"{prefix}/mentor/worklogs", tags=["Mentor - Worklogs"])
    app.include_router(mentor_evaluations.router, prefix=f"{prefix}/mentor/evaluations", tags=["Mentor - Evaluations"])

    return app


app = create_app()
