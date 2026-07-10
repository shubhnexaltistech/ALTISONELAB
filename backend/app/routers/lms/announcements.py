from fastapi import APIRouter, Depends
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.announcement import Announcement

router = APIRouter()


@router.get("")
async def list_announcements(trainee: User = Depends(require_role("trainee"))):
    anns = await Announcement.find(Announcement.is_active == True).sort(-Announcement.created_at).limit(20).to_list()
    return [{"id": str(a.id), "title": a.title, "body": a.body, "created_at": a.created_at} for a in anns]
