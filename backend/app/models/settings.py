from beanie import Document
from typing import Optional
from datetime import datetime


class SiteSettings(Document):
    key: str = "landing"
    site_name: str = "AltisOneLabz"
    enrollment_open: bool = True
    contact_email: Optional[str] = None
    application_fee_display: Optional[str] = None
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "settings"
