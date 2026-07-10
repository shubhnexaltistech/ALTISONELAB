from beanie import Document
from typing import Optional, Literal
from datetime import datetime


class Payment(Document):
    application_id: str
    amount: float
    currency: str = "INR"
    provider: Literal["razorpay"] = "razorpay"
    provider_ref: str
    provider_order_id: Optional[str] = None
    status: Literal["pending", "success", "failed"] = "pending"
    webhook_data: Optional[dict] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "payments"
        indexes = [[("application_id", 1)], [("provider_ref", 1)]]
