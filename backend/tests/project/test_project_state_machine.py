import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.academic import IntakeTeamAllocation
from tests.project.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_proposal_to_active_transition(
    client: AsyncClient,
    student_leader: User,
    faculty_user: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test roadmap activation requires exact weight sum of 100."""
    leader_headers = auth_headers_for(student_leader)
    faculty_headers = auth_headers_for(faculty_user)

    # 1. Create project
    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    res = await client.post("/api/v1/projects", json=proj_payload, headers=leader_headers)
    project_id = res.json()["data"]["id"]

    # 2. Add 3 milestones totaling 100% (25, 35, 40)
    m1 = {
        "sequence_index": 1,
        "title": "Architecture & Specs",
        "description": "Finalize circuit schematic and membrane CAD design.",
        "weight": 25,
        "due_date": "2026-06-30",
    }
    m2 = {
        "sequence_index": 2,
        "title": "Alpha Prototype",
        "description": "Construct 3D printed flow cell and test flow rates.",
        "weight": 35,
        "due_date": "2026-08-31",
    }
    m3 = {
        "sequence_index": 3,
        "title": "Field Pilot & Test",
        "description": "Deploy unit in Nadia district well for 14-day field trial.",
        "weight": 40,
        "due_date": "2026-11-30",
    }
    await client.post(f"/api/v1/projects/{project_id}/milestones", json=m1, headers=leader_headers)
    await client.post(f"/api/v1/projects/{project_id}/milestones", json=m2, headers=leader_headers)
    await client.post(f"/api/v1/projects/{project_id}/milestones", json=m3, headers=leader_headers)

    # 3. Mentor activates project
    act_res = await client.post(f"/api/v1/projects/{project_id}/activate", json={}, headers=faculty_headers)
    assert act_res.status_code == 200
    assert act_res.json()["data"]["status"] == "ACTIVE"


@pytest.mark.asyncio
async def test_activation_fails_with_invalid_weight_sum(
    client: AsyncClient,
    student_leader: User,
    faculty_user: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test activation fails with 422 if milestone weights sum != 100."""
    leader_headers = auth_headers_for(student_leader)
    faculty_headers = auth_headers_for(faculty_user)

    # 1. Create project
    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    res = await client.post("/api/v1/projects", json=proj_payload, headers=leader_headers)
    project_id = res.json()["data"]["id"]

    # 2. Add 3 milestones totaling 80% (20, 30, 30)
    for i, w in enumerate([20, 30, 30], start=1):
        m = {
            "sequence_index": i,
            "title": f"Milestone {i}",
            "description": f"Description for milestone {i} with sufficient length.",
            "weight": w,
            "due_date": "2026-06-30",
        }
        await client.post(f"/api/v1/projects/{project_id}/milestones", json=m, headers=leader_headers)

    # 3. Activation attempt
    act_res = await client.post(f"/api/v1/projects/{project_id}/activate", json={}, headers=faculty_headers)
    assert act_res.status_code == 422
    assert act_res.json()["error"]["code"] == "INVALID_MILESTONE_WEIGHT_SUM"


@pytest.mark.asyncio
async def test_stage_progression(
    client: AsyncClient,
    student_leader: User,
    faculty_user: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test transition through engineering stages."""
    leader_headers = auth_headers_for(student_leader)
    faculty_headers = auth_headers_for(faculty_user)

    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    res = await client.post("/api/v1/projects", json=proj_payload, headers=leader_headers)
    project_id = res.json()["data"]["id"]

    stage_payload = {
        "new_stage": "PROTOTYPE_DEVELOPMENT",
        "reason": "Architecture phase completed and verified in simulation.",
    }
    stage_res = await client.post(f"/api/v1/projects/{project_id}/stage", json=stage_payload, headers=faculty_headers)
    assert stage_res.status_code == 200
    assert stage_res.json()["data"]["current_stage"] == "PROTOTYPE_DEVELOPMENT"
