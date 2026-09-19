import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.academic import IntakeTeamAllocation
from tests.project.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_optimistic_locking_version_conflict_on_project_update(
    client: AsyncClient,
    student_leader: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test updating project with stale version returns 409 OPTIMISTIC_LOCK_ERROR."""
    headers = auth_headers_for(student_leader)

    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    p_res = await client.post("/api/v1/projects", json=proj_payload, headers=headers)
    project_id = p_res.json()["data"]["id"]
    assert p_res.json()["data"]["version"] == 1

    # First update increments version to 2
    u1 = {"title": "Updated Title v1", "version": 1}
    r1 = await client.patch(f"/api/v1/projects/{project_id}", json=u1, headers=headers)
    assert r1.status_code == 200
    assert r1.json()["data"]["version"] == 2

    # Second update using stale version 1 fails
    u2 = {"title": "Conflicting Update", "version": 1}
    r2 = await client.patch(f"/api/v1/projects/{project_id}", json=u2, headers=headers)
    assert r2.status_code == 409
    assert r2.json()["error"]["code"] == "OPTIMISTIC_LOCK_ERROR"
