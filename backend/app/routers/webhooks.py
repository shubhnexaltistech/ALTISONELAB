import hmac
import hashlib
from fastapi import APIRouter, Request, HTTPException
from app.config import settings
from app.models.application import Application
from app.models.payment import Payment
from datetime import datetime, timezone

router = APIRouter()


@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    payload = await request.json()
    event = payload.get("event", "")
    if event == "payment.captured":
        payment_entity = payload["payload"]["payment"]["entity"]
        provider_ref = payment_entity.get("id")
        existing_payment = await Payment.find_one(Payment.provider_ref == provider_ref)
        if existing_payment:
            return {"status": "already_processed"}
        notes = payment_entity.get("notes", {})
        application_id = notes.get("application_id")
        if not application_id:
            return {"status": "ignored"}
        payment = Payment(
            application_id=application_id,
            amount=payment_entity.get("amount", 0) / 100,
            provider_ref=provider_ref,
            provider_order_id=payment_entity.get("order_id"),
            status="success",
            webhook_data=payment_entity,
        )
        await payment.insert()
        app = await Application.get(application_id)
        if app and app.status == "pending":
            app.status = "paid"
            app.payment_ref = provider_ref
            app.updated_at = datetime.now(timezone.utc)
            await app.save()
    return {"status": "ok"}
