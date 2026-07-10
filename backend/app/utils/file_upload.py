import mimetypes
import os
import uuid
from fastapi import UploadFile, HTTPException
from app.config import settings

try:
    import magic as _magic
except (ImportError, OSError):
    _magic = None

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx"}
ALLOWED_MIMES = {
    "image/jpeg", "image/png", "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _detect_mime(content: bytes, filename: str | None, content_type: str | None) -> str:
    if _magic is not None:
        try:
            return _magic.from_buffer(content, mime=True)
        except Exception:
            pass
    if content_type and content_type != "application/octet-stream":
        return content_type.split(";")[0].strip()
    guessed, _ = mimetypes.guess_type(filename or "")
    return guessed or "application/octet-stream"


async def save_upload(file: UploadFile, subfolder: str = "general") -> str:
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max 10MB.")
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Extension not allowed: {ext}")
    mime = _detect_mime(content, file.filename, file.content_type)
    if mime not in ALLOWED_MIMES:
        raise HTTPException(status_code=400, detail=f"File type not allowed: {mime}")
    filename = f"{uuid.uuid4().hex}{ext}"
    dir_path = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(dir_path, exist_ok=True)
    file_path = os.path.join(dir_path, filename)
    with open(file_path, "wb") as f:
        f.write(content)
    return f"{subfolder}/{filename}"
