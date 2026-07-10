from beanie import Document
from typing import Optional, Literal
from datetime import datetime


class Application(Document):
    applicant_name: str
    email: str
    phone: str
    college: Optional[str] = None
    city: Optional[str] = None
    track_id: str
    track_name: str
    status: Literal["pending", "paid", "verified"] = "pending"
    payment_ref: Optional[str] = None
    unique_id: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "applications"
        indexes = [
            [("status", 1), ("created_at", -1)],
            [("track_id", 1), ("status", 1)],
        ]
