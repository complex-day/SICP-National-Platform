"""Audit-Event Ingestion Pipeline for Governance & Impact Intelligence (Module 7).

Implements the standard versioned Audit-Event Ingestion Contract:
- Event Schema validation (UUIDs, ISO-8601 timestamps, schema_version = '1.0')
- Idempotency guarantees (deduplication by event_id)
- Integration with M1 audit_logs ledger via AuditRepository
"""

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Dict, Any, Set
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.audit_log import AuditLog
from app.repositories.audit_repository import AuditRepository


class IngestionStatus(str, Enum):
    ACCEPTED = "ACCEPTED"
    DUPLICATE_IGNORED = "DUPLICATE_IGNORED"
    REJECTED = "REJECTED"


class GovernanceEventDTO(BaseModel):
    event_id: uuid.UUID = Field(default_factory=uuid.uuid4, description="Unique event identifier (RFC 4122)")
    event_type: str = Field(..., description="Standardized governance event type")
    actor_id: Optional[uuid.UUID] = Field(default=None, description="User UUID executing the action")
    actor_role: Optional[str] = Field(default=None, description="User role at the time of execution")
    source_module: str = Field(..., description="Originating module code (e.g. M1, M2, M3, M4, M5, M6, M7)")
    entity_type: str = Field(..., description="Entity class name mutated")
    entity_id: Optional[uuid.UUID] = Field(default=None, description="Target entity UUID")
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp of the mutation")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary event payload and metrics")
    schema_version: str = Field(default="1.0", description="Strict schema version identifier")

    @field_validator("schema_version")
    @classmethod
    def validate_schema_version(cls, v: str) -> str:
        if v != "1.0":
            raise ValueError(f"Unsupported schema_version: '{v}'. Only '1.0' is supported.")
        return v


class IngestionResult(BaseModel):
    event_id: uuid.UUID
    status: IngestionStatus
    message: str
    audit_id: Optional[uuid.UUID] = None


class AuditEventIngestor:
    """Ingests and validates domain events from M1-M6 into the governance analytical stream."""

    _memory_dedup_cache: Set[uuid.UUID] = set()

    @classmethod
    async def ingest(cls, session: AsyncSession, event: GovernanceEventDTO) -> IngestionResult:
        """Process and persist a validated governance domain event."""
        # 1. Fast in-memory deduplication check
        if event.event_id in cls._memory_dedup_cache:
            return IngestionResult(
                event_id=event.event_id,
                status=IngestionStatus.DUPLICATE_IGNORED,
                message=f"Event {event.event_id} already ingested (cache match).",
            )

        # 2. Database deduplication check via audit metadata
        stmt = select(AuditLog).where(AuditLog.metadata_json.is_not(None))
        res = await session.execute(stmt)
        for log in res.scalars().all():
            if isinstance(log.metadata_json, dict) and log.metadata_json.get("event_id") == str(event.event_id):
                cls._memory_dedup_cache.add(event.event_id)
                return IngestionResult(
                    event_id=event.event_id,
                    status=IngestionStatus.DUPLICATE_IGNORED,
                    message=f"Event {event.event_id} already exists in audit ledger.",
                    audit_id=log.id,
                )

        # 3. Construct enriched audit metadata
        metadata = {
            "event_id": str(event.event_id),
            "schema_version": event.schema_version,
            "source_module": event.source_module,
            "actor_role": event.actor_role,
            "occurred_at": event.occurred_at.isoformat(),
            **event.payload,
        }

        # 4. Append to immutable audit ledger (M1)
        audit_entry = await AuditRepository.create_log(
            session=session,
            action=event.event_type,
            entity_type=event.entity_type,
            user_id=event.actor_id,
            entity_id=event.entity_id,
            metadata=metadata,
        )

        # 5. Update deduplication cache
        cls._memory_dedup_cache.add(event.event_id)

        return IngestionResult(
            event_id=event.event_id,
            status=IngestionStatus.ACCEPTED,
            message=f"Event {event.event_id} successfully ingested.",
            audit_id=audit_entry.id,
        )
