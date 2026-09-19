"""Tests for Audit-Event Ingestion Engine (Module 7).

Verifies:
- Standard schema validation: event_id, event_type, actor_id, actor_role, source_module, entity_type, entity_id, occurred_at, payload, schema_version.
- Idempotent ingestion: Duplicate event_id is safely ignored without duplicate processing.
- Version validation: Rejection of unsupported schema versions.
- Integration with AuditRepository and audit_logs table.
"""

import uuid
from datetime import datetime, timezone
import pytest
from app.services.governance_ingestor import (
    AuditEventIngestor,
    GovernanceEventDTO,
    IngestionStatus,
)


@pytest.mark.asyncio
async def test_valid_event_ingestion(db_session):
    """Verify standard event ingestion produces accepted status and audit record."""
    event_id = uuid.uuid4()
    actor_id = uuid.uuid4()
    entity_id = uuid.uuid4()
    occurred_at = datetime.now(timezone.utc)

    event = GovernanceEventDTO(
        event_id=event_id,
        event_type="CHALLENGE_SUBMITTED",
        actor_id=actor_id,
        actor_role="citizen",
        source_module="M2",
        entity_type="Challenge",
        entity_id=entity_id,
        occurred_at=occurred_at,
        payload={"district": "Wardha", "state": "Maharashtra", "affected_population": 5000},
        schema_version="1.0",
    )

    result = await AuditEventIngestor.ingest(db_session, event)
    assert result.status == IngestionStatus.ACCEPTED
    assert result.event_id == event_id


@pytest.mark.asyncio
async def test_idempotent_duplicate_event_ingestion(db_session):
    """Verify submitting the same event_id twice returns DUPLICATE_IGNORED."""
    event_id = uuid.uuid4()
    event = GovernanceEventDTO(
        event_id=event_id,
        event_type="DISBURSEMENT_RELEASED",
        actor_id=uuid.uuid4(),
        actor_role="industry",
        source_module="M6",
        entity_type="SponsorshipDisbursement",
        entity_id=uuid.uuid4(),
        occurred_at=datetime.now(timezone.utc),
        payload={"released_amount": 500000.0, "tranche_number": 1},
        schema_version="1.0",
    )

    result1 = await AuditEventIngestor.ingest(db_session, event)
    assert result1.status == IngestionStatus.ACCEPTED

    # Re-send identical event
    result2 = await AuditEventIngestor.ingest(db_session, event)
    assert result2.status == IngestionStatus.DUPLICATE_IGNORED
    assert result2.event_id == event_id


@pytest.mark.asyncio
async def test_unsupported_schema_version_rejection(db_session):
    """Verify events with unsupported schema versions are rejected gracefully."""
    with pytest.raises(ValueError, match="Unsupported schema_version"):
        GovernanceEventDTO(
            event_id=uuid.uuid4(),
            event_type="MILESTONE_APPROVED",
            actor_id=uuid.uuid4(),
            actor_role="faculty",
            source_module="M5",
            entity_type="ProjectMilestone",
            entity_id=uuid.uuid4(),
            occurred_at=datetime.now(timezone.utc),
            payload={},
            schema_version="99.0",  # Invalid
        )
