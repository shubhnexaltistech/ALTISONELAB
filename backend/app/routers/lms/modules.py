from fastapi import APIRouter, Depends, HTTPException
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.module import Module
from app.models.trainee_progress import TraineeProgress
from app.schemas.module import ModuleDetailResponse, ModuleListItem, ModuleTaskResponse
from app.services.quiz_service import ensure_module_unlocked

router = APIRouter()


@router.get("", response_model=list[ModuleListItem])
async def list_modules(trainee: User = Depends(require_role("trainee"))):
    uid = str(trainee.id)
    modules = await Module.find(Module.track_id == trainee.track_id).sort(Module.order).to_list()
    result = []
    for m in modules:
        p = await TraineeProgress.find_one(
            TraineeProgress.user_id == uid,
            TraineeProgress.module_id == str(m.id),
        )
        result.append(
            ModuleListItem(
                id=str(m.id),
                title=m.title,
                order=m.order,
                description=m.description,
                quiz_id=m.quiz_id,
                is_unlocked=p.is_unlocked if p else (m.order == 1),
                quiz_passed=p.quiz_passed if p else False,
            )
        )
    return result


@router.get("/{module_id}", response_model=ModuleDetailResponse)
async def get_module(module_id: str, trainee: User = Depends(require_role("trainee"))):
    module = await Module.get(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Not found")
    await ensure_module_unlocked(str(trainee.id), module_id)
    return ModuleDetailResponse(
        id=str(module.id),
        title=module.title,
        order=module.order,
        description=module.description,
        tasks=[ModuleTaskResponse(**t.model_dump()) for t in module.tasks],
        quiz_id=module.quiz_id,
    )
