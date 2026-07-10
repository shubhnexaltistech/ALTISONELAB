import hmac
import hashlib
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Literal
from app.config import settings
from app.models.application import Application
from app.models.track import Track
from app.models.user import User
from app.models.settings import SiteSettings

router = APIRouter()


class ApplyRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    college: Optional[str] = None
    city: Optional[str] = None
    track_id: str


class ApplyResponse(BaseModel):
    id: str
    message: str


class TrackResponse(BaseModel):
    id: str
    name: str
    code: str
    slug: str
    description: Optional[str] = None
    fee_inr: Optional[int] = None
    duration: Optional[str] = None


class TrackDetailResponse(TrackResponse):
    highlights: Optional[str] = None
    outcomes: Optional[str] = None


class SettingsResponse(BaseModel):
    site_name: str
    enrollment_open: bool
    contact_email: Optional[str] = None
    application_fee_display: Optional[str] = None


class NotifyRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    track_id: Optional[str] = None


class PaymentProofRequest(BaseModel):
    application_id: str
    reference: str
    amount: Optional[int] = None


class PaymentOrderRequest(BaseModel):
    application_id: str


class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str


class ApplicationStatusResponse(BaseModel):
    id: str
    applicant_name: str
    email: str
    track_name: str
    status: Literal["pending", "paid", "verified"]
    unique_id: Optional[str] = None


@router.post("/apply", response_model=ApplyResponse, status_code=201)
async def submit_application(body: ApplyRequest):
    track = await Track.get(body.track_id)
    if not track or not track.is_active:
        raise HTTPException(status_code=400, detail="Invalid track")
    existing = await Application.find_one(
        Application.email == body.email,
        Application.status == "pending",
    )
    if existing:
        raise HTTPException(status_code=400, detail="Pending application already exists")
    application = Application(
        applicant_name=body.name,
        email=body.email,
        phone=body.phone,
        college=body.college,
        city=body.city,
        track_id=body.track_id,
        track_name=track.name,
    )
    await application.insert()
    return ApplyResponse(id=str(application.id), message="Application submitted successfully")


@router.get("/tracks", response_model=List[TrackResponse])
async def list_tracks():
    tracks = await Track.find(Track.is_active == True).to_list()
    return [
        TrackResponse(
            id=str(t.id),
            name=t.name,
            code=t.code,
            slug=(t.slug or t.code.lower()),
            description=t.description,
            fee_inr=t.fee_inr,
            duration=t.duration,
        )
        for t in tracks
    ]


@router.get("/tracks/{slug}", response_model=TrackDetailResponse)
async def get_track_by_slug(slug: str):
    track = await Track.find_one(Track.slug == slug)
    if not track:
        track = await Track.find_one(Track.code == slug.upper())
    if not track or not track.is_active:
        raise HTTPException(status_code=404, detail="Track not found")
    return TrackDetailResponse(
        id=str(track.id),
        name=track.name,
        code=track.code,
        slug=(track.slug or track.code.lower()),
        description=track.description,
        fee_inr=track.fee_inr,
        duration=track.duration,
        highlights=track.highlights,
        outcomes=track.outcomes,
    )


@router.get("/settings", response_model=SettingsResponse)
async def get_settings():
    settings_doc = await SiteSettings.find_one(SiteSettings.key == "landing")
    if not settings_doc:
        settings_doc = SiteSettings()
        await settings_doc.insert()
    return SettingsResponse(
        site_name=settings_doc.site_name,
        enrollment_open=settings_doc.enrollment_open,
        contact_email=settings_doc.contact_email,
        application_fee_display=settings_doc.application_fee_display,
    )


@router.post("/notify", response_model=ApplyResponse)
async def notify_interest(body: NotifyRequest):
    return ApplyResponse(id="notify", message="Thanks! We will notify you when enrollment opens.")


@router.post("/payment-proof", response_model=ApplyResponse)
async def submit_payment_proof(body: PaymentProofRequest):
    app = await Application.get(body.application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplyResponse(id=str(app.id), message="Payment proof received for review.")


@router.get("/applications/{application_id}/status", response_model=ApplicationStatusResponse)
async def get_application_status(application_id: str):
    app = await Application.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationStatusResponse(
        id=str(app.id),
        applicant_name=app.applicant_name,
        email=app.email,
        track_name=app.track_name,
        status=app.status,
        unique_id=app.unique_id,
    )


@router.post("/payments/create-order", response_model=PaymentOrderResponse)
async def create_payment_order(body: PaymentOrderRequest):
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")
    app = await Application.get(body.application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.status != "pending":
        raise HTTPException(status_code=400, detail=f"Application status is {app.status}")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.razorpay.com/v1/orders",
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET),
            json={
                "amount": settings.APPLICATION_FEE_PAISE,
                "currency": "INR",
                "notes": {"application_id": str(app.id)},
            },
        )
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Payment provider error")
    data = response.json()
    return PaymentOrderResponse(
        order_id=data["id"],
        amount=data["amount"],
        currency=data["currency"],
        key_id=settings.RAZORPAY_KEY_ID,
    )
