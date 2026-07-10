from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from app.routers.auth_deps import require_role
from app.models.module import Module, ModuleTask
from app.models.track import Track
from datetime import datetime, timezone

router = APIRouter()


class TaskInput(BaseModel):
    title: str
    description: Optional[str] = None
    order: int


class ModuleCreateRequest(BaseModel):
    track_id: str
    title: str
    order: int
    description: Optional[str] = None
    tasks: List[TaskInput] = []


class ModuleUpdateRequest(BaseModel):
    title: Optional[str] = None
    order: Optional[int] = None
    description: Optional[str] = None
    tasks: Optional[List[TaskInput]] = None


@router.get("")
async def list_modules(track_id: Optional[str] = None, admin=Depends(require_role("admin"))):
    query = {}
    if track_id:
        query["track_id"] = track_id
    modules = await Module.find(query).sort(Module.order).to_list()
    return [
        {
            "id": str(m.id),
            "track_id": m.track_id,
            "title": m.title,
            "order": m.order,
            "description": m.description,
            "task_count": len(m.tasks),
            "quiz_id": m.quiz_id,
        }
        for m in modules
    ]


@router.post("", status_code=201)
async def create_module(body: ModuleCreateRequest, admin=Depends(require_role("admin"))):
    track = await Track.get(body.track_id)
    if not track:
        raise HTTPException(status_code=400, detail="Invalid track")
    tasks = [ModuleTask(**t.model_dump()) for t in body.tasks]
    module = Module(
        track_id=body.track_id,
        title=body.title,
        order=body.order,
        description=body.description,
        tasks=tasks,
    )
    await module.insert()
    track.module_count = await Module.find(Module.track_id == body.track_id).count()
    track.updated_at = datetime.now(timezone.utc)
    await track.save()
    return {"id": str(module.id), "message": "Module created"}


@router.put("/{module_id}")
async def update_module(
    module_id: str, body: ModuleUpdateRequest, admin=Depends(require_role("admin"))
):
    module = await Module.get(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Not found")
    if body.title is not None:
        module.title = body.title
    if body.order is not None:
        module.order = body.order
    if body.description is not None:
        module.description = body.description
    if body.tasks is not None:
        module.tasks = [ModuleTask(**t.model_dump()) for t in body.tasks]
    module.updated_at = datetime.now(timezone.utc)
    await module.save()
    return {"message": "Updated"}


@router.delete("/{module_id}")
async def delete_module(module_id: str, admin=Depends(require_role("admin"))):
    module = await Module.get(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Not found")
    track_id = module.track_id
    await module.delete()
    track = await Track.get(track_id)
    if track:
        track.module_count = await Module.find(Module.track_id == track_id).count()
        await track.save()
    return {"message": "Deleted"}
