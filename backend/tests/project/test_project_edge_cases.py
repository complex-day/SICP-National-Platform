import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.academic import IntakeTeamAllocation
from tests.project.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_completion_blocked_if_milestones_incomplete(
    client: AsyncClient,
    student_leader: User,
    faculty_user: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test project completion fails with 400 if milestones are not 100% approved."""
    leader_headers = auth_headers_for(student_leader)
    faculty_headers = auth_headers_for(faculty_user)

    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    p_res = await client.post("/api/v1/projects", json=proj_payload, headers=leader_headers)
    project_id = p_res.json()["data"]["id"]

    # Attempt premature completion
    comp_payload = {"outcome": "SUCCESS", "score": 90, "feedback": "Attempting premature sign-off"}
    comp_res = await client.post(f"/api/v1/projects/{project_id}/complete", json=comp_payload, headers=faculty_headers)
    assert comp_res.status_code == 400
    assert comp_res.json()["error"]["code"] == "PROJECT_NOT_READY_FOR_COMPLETION"


@pytest.mark.asyncio
async def test_approved_milestone_immutable_rejection(
    client: AsyncClient,
    student_leader: User,
    faculty_user: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test attempting to update an approved milestone returns 400."""
    leader_headers = auth_headers_for(student_leader)
    faculty_headers = auth_headers_for(faculty_user)

    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    p_res = await client.post("/api/v1/projects", json=proj_payload, headers=leader_headers)
    project_id = p_res.json()["data"]["id"]

    m1 = {
        "sequence_index": 1,
        "title": "Milestone 1",
        "description": "Milestone 1 description with sufficient length.",
        "weight": 50,
        "due_date": "2026-06-30",
    }
    m_res = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m1, headers=leader_headers)
    milestone_id = m_res.json()["data"]["id"]

    d1 = {
        "milestone_id": milestone_id,
        "deliverable_type": "DOCUMENTATION",
        "title": "Docs",
        "asset_url": "https://storage.sicp.gov.in/docs.pdf",
    }
    await client.post(f"/api/v1/projects/{project_id}/deliverables", json=d1, headers=leader_headers)
    await client.post(f"/api/v1/projects/{project_id}/milestones/{milestone_id}/submit", headers=leader_headers)

    r1 = {"decision": "APPROVED", "score": 90, "feedback": "Approved"}
    await client.post(f"/api/v1/projects/{project_id}/milestones/{milestone_id}/reviews", json=r1, headers=faculty_headers)

    # Attempt mutation on approved milestone
    patch_res = await client.patch(
        f"/api/v1/projects/{project_id}/milestones/{milestone_id}",
        json={"title": "Altered Title"},
        headers=leader_headers,
    )
    assert patch_res.status_code == 400
    assert patch_res.json()["error"]["code"] == "APPROVED_MILESTONE_IMMUTABLE"
