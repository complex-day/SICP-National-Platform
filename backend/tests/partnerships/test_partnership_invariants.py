import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject, ProjectMilestone
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_funding_invariants_and_tranche_upper_bound(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    student_leader: User,
    faculty_user: User,
    innovation_project: InnovationProject,
    project_milestone: ProjectMilestone,
):
    """Test financial bounds: released <= promised, tranche sum <= promised, zero amount rejected."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    lead_headers = auth_headers_for(student_leader)

    # 1. Register & Verify Partner
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Infosys Foundation",
            "domain": "Education & Rural Water",
            "cin_number": "L85110KA1981PLC013115",
            "csr_budget": 10000000.00,
            "website": "https://www.infosys.org",
            "point_of_contact_name": "Sudha K",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543211",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(
        f"/api/v1/partnerships/partners/{partner_id}/verify",
        json={"status": "VERIFIED"},
        headers=admin_headers,
    )

    # 2. Invariant: Zero promised amount rejected
    zero_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 0.00,
            "terms_and_conditions": "Zero grant test",
        },
        headers=ind_headers,
    )
    assert zero_res.status_code in (400, 422)

    # 3. Invariant: Tranche sum exceeding promised amount rejected
    over_tranche_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 500000.00,
            "tranches": [
                {"tranche_number": 1, "amount": 300000.00, "milestone_id": str(project_milestone.id)},
                {"tranche_number": 2, "amount": 300000.00, "milestone_id": str(project_milestone.id)},
            ],
            "terms_and_conditions": "Over-tranche schedule",
        },
        headers=ind_headers,
    )
    assert over_tranche_res.status_code in (400, 422)

    # 4. Valid Proposal with Tranches <= promised_amount
    valid_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 500000.00,
            "tranches": [
                {"tranche_number": 1, "amount": 200000.00, "milestone_id": str(project_milestone.id)},
            ],
            "terms_and_conditions": "Valid ₹5L grant with ₹2L initial tranche",
        },
        headers=ind_headers,
    )
    assert valid_res.status_code == 201
    agreement_id = valid_res.json()["data"]["id"]
    assert valid_res.json()["data"]["remaining_amount"] == 500000.00
    assert valid_res.json()["data"]["released_amount"] == 0.00


@pytest.mark.asyncio
async def test_pilot_deployment_evidence_gate(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    student_leader: User,
    faculty_user: User,
    innovation_project: InnovationProject,
):
    """Test pilot deployment cannot transition to FULFILLED without verified evidence."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    lead_headers = auth_headers_for(student_leader)

    # 1. Partner Verification
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Municipal Smart Water Corp",
            "domain": "Civic Utilities",
            "cin_number": "U75112MH2018PTC198765",
            "csr_budget": 5000000.00,
            "website": "https://municipalwater.gov.in",
            "point_of_contact_name": "N. Deshmukh",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543299",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    # 2. Create and Approve Pilot Agreement
    agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "PILOT_DEPLOYMENT",
            "pilot_details": {
                "location": "Wardha Rural Water Tank 4",
                "scope": "Continuous 30-day telemetry testbed",
            },
            "terms_and_conditions": "Wardha pilot facility agreement",
        },
        headers=ind_headers,
    )
    agreement_id = agree_res.json()["data"]["id"]
    await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/approve", headers=lead_headers)

    # 3. Attempt to mark FULFILLED without evidence
    fulfill_res = await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/fulfill", headers=admin_headers)
    assert fulfill_res.status_code == 400
    assert "PILOT_EVIDENCE_REQUIRED" in fulfill_res.json()["error"]["code"]
