from typing import Optional, Dict, Any
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog


class AuditRepository:
    """Repository layer for creating and querying audit logs."""

    def __init__(self, session: Optional[AsyncSession] = None):
        self.session = session

    @classmethod
    async def create_log(
        cls,
        session: AsyncSession,
        action: Any,
        entity_type: str,
        user_id: Optional[uuid.UUID] = None,
        entity_id: Optional[uuid.UUID] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        action_val = action.value if hasattr(action, "value") else str(action)
        audit_entry = AuditLog(
            id=uuid.uuid4(),
            user_id=user_id,
            action=action_val,
            entity_type=entity_type,
            entity_id=entity_id,
            metadata_json=metadata,
        )
        session.add(audit_entry)
        await session.flush()
        return audit_entry

    async def log(
        self,
        action: Any,
        entity_type: str,
        user_id: Optional[uuid.UUID] = None,
        entity_id: Optional[uuid.UUID] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        """Create an audit log entry supporting both instance and direct session dispatch."""
        if isinstance(self, AsyncSession):
            session = self
        else:
            session = self.session
        return await AuditRepository.create_log(
            session=session,
            action=action,
            entity_type=entity_type,
            user_id=user_id,
            entity_id=entity_id,
            metadata=metadata,
        )

    @classmethod
    async def get_logs_by_entity(
        cls,
        session: AsyncSession,
        entity_type: Optional[str] = None,
        entity_id: Optional[uuid.UUID] = None,
    ) -> list[AuditLog]:
        from sqlalchemy import select, and_
        filters = []
        if entity_type:
            filters.append(AuditLog.entity_type == entity_type)
        if entity_id:
            filters.append(AuditLog.entity_id == entity_id)
        
        stmt = select(AuditLog).where(and_(*filters)).order_by(AuditLog.created_at.asc())
        res = await session.execute(stmt)
        return list(res.scalars().all())

