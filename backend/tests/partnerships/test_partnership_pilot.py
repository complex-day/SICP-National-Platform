import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_pilot_deployment_workflow_and_evidence_upload(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    student_leader: User,
    innovation_project: InnovationProject,
):
    """Test full pilot deployment workflow from agreement to verified evidence upload."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    lead_headers = auth_headers_for(student_leader)

    # 1. Register & Verify Partner
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Wardha District Water Board",
            "domain": "Civic Administration",
            "cin_number": "U75100MH2015NPL099881",
            "csr_budget": 5000000.00,
            "website": "https://wardha.gov.in",
            "point_of_contact_name": "Collector Office",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543201",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    # 2. Create Pilot Agreement
    agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "PILOT_DEPLOYMENT",
            "pilot_details": {
                "location": "Wardha Tank 12",
                "scope": "Telemetry site testing",
            },
            "terms_and_conditions": "Wardha testbed access",
        },
        headers=ind_headers,
    )
    agreement_id = agree_res.json()["data"]["id"]
    await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/approve", headers=lead_headers)

    # 3. Upload Pilot Evidence
    evi_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/pilot-evidence",
        json={
            "evidence_url": "https://storage.sicp.gov.in/evidence/wardha_pilot_signoff.pdf",
            "evidence_checksum": "b" * 64,
            "summary": "Official municipal sign-off and 30-day continuous telemetry validation report.",
        },
        headers=lead_headers,
    )
    assert evi_res.status_code == 200
    assert evi_res.json()["data"]["commitment_status"] == "FULFILLED"
