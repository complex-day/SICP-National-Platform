import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.academic import IntakeTeamAllocation
from tests.project.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_deliverable_upload_with_sha256(
    client: AsyncClient,
    student_leader: User,
    student_member: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test team member uploads deliverable with valid SHA-256 hash."""
    leader_headers = auth_headers_for(student_leader)
    member_headers = auth_headers_for(student_member)

    # 1. Create project & milestone
    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    p_res = await client.post("/api/v1/projects", json=proj_payload, headers=leader_headers)
    project_id = p_res.json()["data"]["id"]

    m1 = {
        "sequence_index": 1,
        "title": "Architecture & Schematics",
        "description": "Schematic diagrams for power supply and microcontroller.",
        "weight": 50,
        "due_date": "2026-06-30",
    }
    m_res = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m1, headers=leader_headers)
    milestone_id = m_res.json()["data"]["id"]

    # 2. Upload deliverable
    d_payload = {
        "milestone_id": milestone_id,
        "deliverable_type": "DOCUMENTATION",
        "title": "Circuit Schematics v1.0",
        "asset_url": "https://storage.sicp.gov.in/projects/schematics_v1.pdf",
        "file_name": "schematics_v1.pdf",
        "mime_type": "application/pdf",
        "file_size_bytes": 2048500,
        "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    }
    d_res = await client.post(f"/api/v1/projects/{project_id}/deliverables", json=d_payload, headers=member_headers)
    assert d_res.status_code == 201
    deliv = d_res.json()["data"]
    assert deliv["title"] == d_payload["title"]
    assert deliv["version_number"] == 1
    assert deliv["sha256_hash"] == d_payload["sha256_hash"]


@pytest.mark.asyncio
async def test_duplicate_asset_checksum_rejected(
    client: AsyncClient,
    student_leader: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test duplicate asset hash on same milestone returns 409."""
    headers = auth_headers_for(student_leader)

    proj_payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Solar Powered Filter",
        "abstract": "Engineering a solar-powered capacitive deionization unit.",
    }
    p_res = await client.post("/api/v1/projects", json=proj_payload, headers=headers)
    project_id = p_res.json()["data"]["id"]

    m1 = {
        "sequence_index": 1,
        "title": "Architecture & Schematics",
        "description": "Schematic diagrams for power supply and microcontroller.",
        "weight": 50,
        "due_date": "2026-06-30",
    }
    m_res = await client.post(f"/api/v1/projects/{project_id}/milestones", json=m1, headers=headers)
    milestone_id = m_res.json()["data"]["id"]

    d_payload = {
        "milestone_id": milestone_id,
        "deliverable_type": "DOCUMENTATION",
        "title": "Doc 1",
        "asset_url": "https://storage.sicp.gov.in/doc1.pdf",
        "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    }
    await client.post(f"/api/v1/projects/{project_id}/deliverables", json=d_payload, headers=headers)

    # Attempt duplicate
    d_dup = {
        "milestone_id": milestone_id,
        "deliverable_type": "DOCUMENTATION",
        "title": "Doc 2 (Duplicate Hash)",
        "asset_url": "https://storage.sicp.gov.in/doc2.pdf",
        "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    }
    r_dup = await client.post(f"/api/v1/projects/{project_id}/deliverables", json=d_dup, headers=headers)
    assert r_dup.status_code == 409
    assert r_dup.json()["error"]["code"] == "DUPLICATE_ASSET_DETECTED"
