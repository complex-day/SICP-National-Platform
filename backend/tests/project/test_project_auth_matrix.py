import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.academic import IntakeTeamAllocation
from tests.project.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_admin_can_suspend_and_resume_project(
    client: AsyncClient,
    platform_admin: User,
    student_leader: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test platform admin can suspend and resume projects."""
    leader_headers = auth_headers_for(student_leader)
    admin_headers = auth_headers_for(platform_admin)

    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    p_res = await client.post("/api/v1/projects", json=proj_payload, headers=leader_headers)
    project_id = p_res.json()["data"]["id"]

    # Suspend
    sus_payload = {"reason": "Safety audit hold"}
    s_res = await client.post(f"/api/v1/projects/{project_id}/suspend", json=sus_payload, headers=admin_headers)
    assert s_res.status_code == 200
    assert s_res.json()["data"]["status"] == "SUSPENDED"

    # Resume
    r_res = await client.post(f"/api/v1/projects/{project_id}/resume", headers=admin_headers)
    assert r_res.status_code == 200
    assert r_res.json()["data"]["status"] == "ACTIVE"


@pytest.mark.asyncio
async def test_non_admin_cannot_suspend_project(
    client: AsyncClient,
    student_leader: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test students cannot suspend projects."""
    leader_headers = auth_headers_for(student_leader)

    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    p_res = await client.post("/api/v1/projects", json=proj_payload, headers=leader_headers)
    project_id = p_res.json()["data"]["id"]

    s_res = await client.post(f"/api/v1/projects/{project_id}/suspend", json={"reason": "Test"}, headers=leader_headers)
    assert s_res.status_code == 403
