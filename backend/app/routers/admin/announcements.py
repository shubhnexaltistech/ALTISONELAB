from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.routers.auth_deps import require_role
from app.models.announcement import Announcement
from pydantic import BaseModel

router = APIRouter()


class AnnouncementRequest(BaseModel):
    title: str
    body: str
    target_tracks: List[str] = []


@router.get("")
async def list_announcements(admin=Depends(require_role("admin"))):
    anns = await Announcement.find().sort(-Announcement.created_at).to_list()
    return [{"id": str(a.id), "title": a.title, "body": a.body, "is_active": a.is_active, "created_at": a.created_at} for a in anns]


@router.post("", status_code=201)
async def create_announcement(body: AnnouncementRequest, admin=Depends(require_role("admin"))):
    ann = Announcement(title=body.title, body=body.body, target_tracks=body.target_tracks, created_by=str(admin.id))
    await ann.insert()
    return {"id": str(ann.id), "message": "Created"}


@router.delete("/{ann_id}")
async def delete_announcement(ann_id: str, admin=Depends(require_role("admin"))):
    ann = await Announcement.get(ann_id)
    if not ann:
        raise HTTPException(status_code=404, detail="Not found")
    ann.is_active = False
    await ann.save()
    return {"message": "Deactivated"}
