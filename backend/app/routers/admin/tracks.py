from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.routers.auth_deps import require_role
from app.models.track import Track
from app.models.module import Module
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter()


class TrackCreateRequest(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


@router.get("")
async def list_tracks(admin=Depends(require_role("admin"))):
    tracks = await Track.find().sort(-Track.created_at).to_list()
    result = []
    for t in tracks:
        mc = await Module.find(Module.track_id == str(t.id)).count()
        result.append({"id": str(t.id), "name": t.name, "code": t.code,
                       "description": t.description, "is_active": t.is_active, "module_count": mc})
    return result


@router.post("", status_code=201)
async def create_track(body: TrackCreateRequest, admin=Depends(require_role("admin"))):
    existing = await Track.find_one(Track.code == body.code)
    if existing:
        raise HTTPException(status_code=400, detail="Track code exists")
    track = Track(name=body.name, code=body.code, description=body.description)
    await track.insert()
    return {"id": str(track.id), "message": "Track created"}


@router.delete("/{track_id}")
async def delete_track(track_id: str, admin=Depends(require_role("admin"))):
    track = await Track.get(track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Not found")
    track.is_active = False
    await track.save()
    return {"message": "Track deactivated"}
