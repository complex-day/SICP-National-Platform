"""Tests for Governance Audit Logging & Immutability."""

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.audit_log import AuditLog
from tests.governance.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_governance_audit_emission(client: AsyncClient, db_session, full_governance_seed: dict, platform_admin):
    """Verify snapshot recalculation and public transparency queries emit audit logs."""
    headers = auth_headers_for(platform_admin)

    # 1. Trigger recalculate
    await client.post("/api/v1/governance/snapshots/recalculate", json={"recalculate_all": True}, headers=headers)

    # 2. Query public transparency
    await client.get("/api/v1/governance/public/transparency")

    # 3. Verify audit log records
    stmt = select(AuditLog).where(AuditLog.action.in_(["GOVERNANCE_DATA_RECALCULATED", "PUBLIC_TRANSPARENCY_ACCESSED"]))
    res = await db_session.execute(stmt)
    logs = list(res.scalars().all())

    actions = [log.action for log in logs]
    assert "GOVERNANCE_DATA_RECALCULATED" in actions
    assert "PUBLIC_TRANSPARENCY_ACCESSED" in actions
