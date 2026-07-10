from fastapi import APIRouter, Depends, UploadFile, File
from app.routers.auth_deps import require_role
from app.utils.file_upload import save_upload

router = APIRouter()


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    admin=Depends(require_role("admin")),
):
    path = await save_upload(file, subfolder="admin")
    return {"path": path, "url": f"/uploads/{path}"}
