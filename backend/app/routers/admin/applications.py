from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Literal
from app.routers.auth_deps import require_role
from app.models.application import Application
from app.models.audit_log import AuditLog
from app.services.application_service import verify_application
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone

router = APIRouter()


class ApplicationCreateRequest(BaseModel):
    applicant_name: str
    email: EmailStr
    phone: str
    college: Optional[str] = None
    city: Optional[str] = None
    track_id: str
    track_name: str


@router.get("")
async def list_applications(
    admin=Depends(require_role("admin")),
    status: Optional[Literal["pending", "paid", "verified"]] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    query = {}
    if status:
        query["status"] = status
    total = await Application.find(query).count()
    applications = await Application.find(query).sort(-Application.created_at).skip((page-1)*limit).limit(limit).to_list()
    return {
        "data": [
            {"id": str(a.id), "applicant_name": a.applicant_name, "email": a.email,
             "phone": a.phone, "track_name": a.track_name, "status": a.status,
             "unique_id": a.unique_id, "created_at": a.created_at}
            for a in applications
        ],
        "total": total, "page": page, "pages": (total + limit - 1) // limit,
    }


@router.post("", status_code=201)
async def create_application(body: ApplicationCreateRequest, admin=Depends(require_role("admin"))):
    application = Application(**body.model_dump())
    await application.insert()
    return {"id": str(application.id), "message": "Application created"}


@router.put("/{application_id}/verify")
async def verify_app(application_id: str, admin=Depends(require_role("admin"))):
    try:
        user = await verify_application(application_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    await AuditLog(
        actor_id=str(admin.id), actor_role="admin", action="application.verify",
        resource_type="application", resource_id=application_id,
        metadata={"trainee_unique_id": user.unique_id},
    ).insert()
    return {"message": "Verified", "trainee_unique_id": user.unique_id}


@router.delete("/{application_id}")
async def delete_application(application_id: str, admin=Depends(require_role("admin"))):
    app = await Application.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    if app.status == "verified":
        raise HTTPException(status_code=400, detail="Cannot delete verified application")
    await app.delete()
    return {"message": "Deleted"}
