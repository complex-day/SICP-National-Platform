import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.academic import IntakeTeamAllocation
from app.models.audit_log import AuditLog
from tests.project.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_project_audit_logging(
    client: AsyncClient,
    db_session: AsyncSession,
    student_leader: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test project lifecycle events emit persistent audit logs."""
    headers = auth_headers_for(student_leader)

    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    p_res = await client.post("/api/v1/projects", json=proj_payload, headers=headers)
    project_id = p_res.json()["data"]["id"]

    # Check audit logs in DB
    import uuid
    stmt = select(AuditLog).where(AuditLog.entity_id == uuid.UUID(project_id))
    result = await db_session.execute(stmt)
    logs = list(result.scalars().all())

    assert len(logs) >= 1
    actions = [log.action for log in logs]
    assert "PROJECT_CREATED" in actions

