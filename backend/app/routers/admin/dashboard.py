from fastapi import APIRouter, Depends
from app.routers.auth_deps import require_role
from app.models.user import User
from app.models.application import Application
from app.models.payment import Payment

router = APIRouter()


@router.get("/dashboard")
async def admin_dashboard(admin=Depends(require_role("admin"))):
    total_apps = await Application.find().count()
    pending = await Application.find(Application.status == "pending").count()
    paid = await Application.find(Application.status == "paid").count()
    verified = await Application.find(Application.status == "verified").count()
    trainees = await User.find(User.role == "trainee", User.is_active == True).count()
    mentors = await User.find(User.role == "mentor", User.is_active == True).count()
    payments = await Payment.find(Payment.status == "success").to_list()
    revenue = sum(p.amount for p in payments)
    return {
        "applications": {"total": total_apps, "pending": pending, "paid": paid, "verified": verified},
        "users": {"trainees": trainees, "mentors": mentors},
        "revenue": {"total": revenue, "currency": "INR"},
    }
