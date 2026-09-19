import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.academic import IntakeTeamAllocation
from tests.project.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_full_innovation_project_lifecycle_e2e(
    client: AsyncClient,
    student_leader: User,
    faculty_user: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """End-to-End Test: Instantiation -> Milestones -> Activation -> Deliverables -> Reviews -> Completion."""
    leader_headers = auth_headers_for(student_leader)
    faculty_headers = auth_headers_for(faculty_user)

    # 1. Instantiation
    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Low-Cost Graphene Water Filtration System",
        "abstract": "Design and deployment of solar-powered capacitive deionization unit.",
        "repository_url": "https://github.com/aquaclean/core",
        "demo_url": "https://demo.aquaclean.org",
        "tech_stack": ["Python", "FastAPI", "C++", "FreeRTOS"],
        "target_completion_date": "2026-12-31",
    }
    p_res = await client.post("/api/v1/projects", json=proj_payload, headers=leader_headers)
    assert p_res.status_code == 201
    project_id = p_res.json()["data"]["id"]

    # 2. Add 3 milestones totaling 100% (30, 30, 40)
    m1_data = {
        "sequence_index": 1,
        "title": "Architecture & Simulation",
        "description": "CFD flow simulation and circuit schematic design.",
        "weight": 30,
        "due_date": "2026-05-30",
    }
    m2_data = {
        "sequence_index": 2,
        "title": "Prototype Development",
        "description": "Construct benchtop prototype and verify flow rates.",
        "weight": 30,
        "due_date": "2026-08-30",
    }
    m3_data = {
        "sequence_index": 3,
        "title": "Field Pilot Validation",
        "description": "Deploy prototype in village well for 14-day continuous operation.",
        "weight": 40,
        "due_date": "2026-11-30",
    }
    m1_res = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m1_data, headers=leader_headers)
    m2_res = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m2_data, headers=leader_headers)
    m3_res = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m3_data, headers=leader_headers)

    m1_id = m1_res.json()["data"]["id"]
    m2_id = m2_res.json()["data"]["id"]
    m3_id = m3_res.json()["data"]["id"]

    # 3. Activate Roadmap
    act_res = await client.post(f"/api/v1/projects/{project_id}/activate", json={}, headers=faculty_headers)
    assert act_res.status_code == 200
    assert act_res.json()["data"]["status"] == "ACTIVE"

    # 4. Milestone 1: Upload Deliverable, Submit, Mentor Approve
    d1 = {
        "milestone_id": m1_id,
        "deliverable_type": "DOCUMENTATION",
        "title": "Simulation & Design Docs",
        "asset_url": "https://storage.sicp.gov.in/m1_docs.pdf",
    }
    await client.post(f"/api/v1/projects/{project_id}/deliverables", json=d1, headers=leader_headers)
    await client.post(f"/api/v1/projects/{project_id}/milestones/{m1_id}/submit", headers=leader_headers)

    r1 = {
        "decision": "APPROVED",
        "score": 92,
        "feedback": "Simulation results meet specifications.",
    }
    await client.post(f"/api/v1/projects/{project_id}/milestones/{m1_id}/reviews", json=r1, headers=faculty_headers)

    # 5. Milestone 2: Upload Deliverable, Submit, Mentor Approve
    d2 = {
        "milestone_id": m2_id,
        "deliverable_type": "PROTOTYPE_DEMO",
        "title": "Lab Prototype Demo Video",
        "asset_url": "https://video.sicp.gov.in/demo_m2.mp4",
    }
    await client.post(f"/api/v1/projects/{project_id}/deliverables", json=d2, headers=leader_headers)
    await client.post(f"/api/v1/projects/{project_id}/milestones/{m2_id}/submit", headers=leader_headers)

    r2 = {
        "decision": "APPROVED",
        "score": 95,
        "feedback": "Lab prototype verified at 99.2% arsenic reduction.",
    }
    await client.post(f"/api/v1/projects/{project_id}/milestones/{m2_id}/reviews", json=r2, headers=faculty_headers)

    # 6. Milestone 3: Upload Deliverable, Submit, Mentor Approve
    d3 = {
        "milestone_id": m3_id,
        "deliverable_type": "DEPLOYMENT_PROOF",
        "title": "Field Pilot Assay Report",
        "asset_url": "https://storage.sicp.gov.in/field_pilot.pdf",
    }
    await client.post(f"/api/v1/projects/{project_id}/deliverables", json=d3, headers=leader_headers)
    await client.post(f"/api/v1/projects/{project_id}/milestones/{m3_id}/submit", headers=leader_headers)

    r3 = {
        "decision": "APPROVED",
        "score": 98,
        "feedback": "Exceptional field test results. Safe drinking water provided to 500 households.",
        "is_final_signoff": True,
    }
    await client.post(f"/api/v1/projects/{project_id}/milestones/{m3_id}/reviews", json=r3, headers=faculty_headers)

    # 7. Check Project reaches REVIEW_READY (100% progress)
    p_check = await client.get(f"/api/v1/projects/{project_id}", headers=leader_headers)
    assert p_check.json()["data"]["progress_percentage"] == 100
    assert p_check.json()["data"]["status"] == "REVIEW_READY"

    # 8. Complete Project
    comp_payload = {
        "outcome": "SUCCESS",
        "score": 95,
        "feedback": "Project successfully verified and recommended for M6 Industry CSR scaling.",
    }
    comp_res = await client.post(f"/api/v1/projects/{project_id}/complete", json=comp_payload, headers=faculty_headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["data"]["status"] == "COMPLETED"
    assert comp_res.json()["data"]["project_outcome"] == "SUCCESS"
