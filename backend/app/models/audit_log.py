from beanie import Document
from typing import Optional
from datetime import datetime


class AuditLog(Document):
    actor_id: str
    actor_role: str
    action: str
    resource_type: str
    resource_id: str
    metadata: Optional[dict] = None
    ip_address: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

    class Settings:
        name = "audit_log"
        indexes = [[("timestamp", -1)], [("actor_id", 1), ("timestamp", -1)]]
