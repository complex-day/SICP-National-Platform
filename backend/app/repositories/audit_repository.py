from typing import Optional, Dict, Any
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog


class AuditRepository:
    """Repository layer for creating and querying audit logs."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def log(
        self,
        action: str,
        entity_type: str,
        user_id: Optional[uuid.UUID] = None,
        entity_id: Optional[uuid.UUID] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """Create an audit log entry."""
        audit_entry = AuditLog(
            id=uuid.uuid4(),
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            metadata_json=metadata
        )
        self.session.add(audit_entry)
        await self.session.flush()
        return audit_entry
