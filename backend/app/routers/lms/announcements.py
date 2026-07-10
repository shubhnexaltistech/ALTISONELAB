from fastapi import APIRouter, Depends, HTTPException
from app.routers.auth_deps import get_current_user
from app.models.user import User
from app.models.announcement import Announcement

router = APIRouter()


@router.get("")
async def list_announcements(user: User = Depends(get_current_user)):
    if user.role not in ("trainee", "mentor"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    anns = await Announcement.find(Announcement.is_active == True).sort(-Announcement.created_at).limit(20).to_list()
    return [{"id": str(a.id), "title": a.title, "body": a.body, "created_at": a.created_at} for a in anns]
