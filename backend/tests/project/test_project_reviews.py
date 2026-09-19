import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.academic import IntakeTeamAllocation
from tests.project.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_faculty_review_approved_updates_progress(
    client: AsyncClient,
    student_leader: User,
    faculty_user: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test mentor review with APPROVED updates progress percentage."""
    leader_headers = auth_headers_for(student_leader)
    faculty_headers = auth_headers_for(faculty_user)

    # 1. Project & Milestones
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
        "description": "Milestone 1 description of sufficient length.",
        "weight": 40,
        "due_date": "2026-06-30",
    }
    m_res = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m1, headers=leader_headers)
    milestone_id = m_res.json()["data"]["id"]

    # 2. Upload deliverable & submit milestone
    d_payload = {
        "milestone_id": milestone_id,
        "deliverable_type": "CODE_REPOSITORY",
        "title": "Firmware repo",
        "asset_url": "https://github.com/aquaclean/firmware",
    }
    await client.post(f"/api/v1/projects/{project_id}/deliverables", json=d_payload, headers=leader_headers)
    await client.post(f"/api/v1/projects/{project_id}/milestones/{milestone_id}/submit", headers=leader_headers)

    # 3. Faculty reviews and approves
    rev_payload = {
        "decision": "APPROVED",
        "score": 94,
        "feedback": "Outstanding technical architecture and thorough test cases.",
        "rubric_breakdown": {"rigor": 95, "completeness": 92, "innovation": 95},
    }
    rev_res = await client.post(
        f"/api/v1/projects/{project_id}/milestones/{milestone_id}/reviews",
        json=rev_payload,
        headers=faculty_headers,
    )
    assert rev_res.status_code == 201
    assert rev_res.json()["data"]["decision"] == "APPROVED"

    # 4. Check project progress updated to 40%
    proj_res = await client.get(f"/api/v1/projects/{project_id}", headers=leader_headers)
    assert proj_res.json()["data"]["progress_percentage"] == 40


@pytest.mark.asyncio
async def test_unauthorized_user_cannot_submit_review(
    client: AsyncClient,
    student_leader: User,
    student_member: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test students cannot submit faculty reviews (returns 403)."""
    leader_headers = auth_headers_for(student_leader)
    member_headers = auth_headers_for(student_member)

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
        "description": "Milestone 1 description of sufficient length.",
        "weight": 50,
        "due_date": "2026-06-30",
    }
    m_res = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m1, headers=leader_headers)
    milestone_id = m_res.json()["data"]["id"]

    rev_payload = {
        "decision": "APPROVED",
        "score": 100,
        "feedback": "Self-approval attempt.",
    }
    rev_res = await client.post(
        f"/api/v1/projects/{project_id}/milestones/{milestone_id}/reviews",
        json=rev_payload,
        headers=member_headers,
    )
    assert rev_res.status_code == 403
