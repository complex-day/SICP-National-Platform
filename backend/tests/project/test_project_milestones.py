import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.academic import IntakeTeamAllocation
from tests.project.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_duplicate_milestone_sequence_rejected(
    client: AsyncClient,
    student_leader: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test duplicate milestone sequence index returns 409."""
    headers = auth_headers_for(student_leader)
    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    res = await client.post("/api/v1/projects", json=proj_payload, headers=headers)
    project_id = res.json()["data"]["id"]

    m1 = {
        "sequence_index": 1,
        "title": "Milestone 1",
        "description": "Description for milestone 1 with sufficient length.",
        "weight": 50,
        "due_date": "2026-06-30",
    }
    r1 = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m1, headers=headers)
    assert r1.status_code == 201

    # Duplicate sequence index 1
    m2 = {
        "sequence_index": 1,
        "title": "Duplicate Sequence Milestone",
        "description": "Description for duplicate milestone with sufficient length.",
        "weight": 50,
        "due_date": "2026-07-30",
    }
    r2 = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m2, headers=headers)
    assert r2.status_code == 409
    assert r2.json()["error"]["code"] == "DUPLICATE_MILESTONE_SEQUENCE"


@pytest.mark.asyncio
async def test_sequential_submission_enforcement(
    client: AsyncClient,
    student_leader: User,
    faculty_user: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test Milestone 2 cannot be submitted before Milestone 1 is approved."""
    leader_headers = auth_headers_for(student_leader)
    faculty_headers = auth_headers_for(faculty_user)

    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    res = await client.post("/api/v1/projects", json=proj_payload, headers=leader_headers)
    project_id = res.json()["data"]["id"]

    m1 = {
        "sequence_index": 1,
        "title": "Milestone 1",
        "description": "Description for milestone 1 with sufficient length.",
        "weight": 50,
        "due_date": "2026-06-30",
    }
    m2 = {
        "sequence_index": 2,
        "title": "Milestone 2",
        "description": "Description for milestone 2 with sufficient length.",
        "weight": 50,
        "due_date": "2026-08-30",
    }
    r1 = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m1, headers=leader_headers)
    r2 = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m2, headers=leader_headers)
    m2_id = r2.json()["data"]["id"]

    # Attempt to submit milestone 2 while milestone 1 is DRAFT/IN_PROGRESS
    sub_res = await client.post(f"/api/v1/projects/{project_id}/milestones/{m2_id}/submit", headers=leader_headers)
    assert sub_res.status_code == 400
    assert sub_res.json()["error"]["code"] == "PREVIOUS_MILESTONES_INCOMPLETE"
