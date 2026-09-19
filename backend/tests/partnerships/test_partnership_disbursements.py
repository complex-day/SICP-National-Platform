import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject, ProjectMilestone
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_milestone_linked_disbursement_schedule_and_release(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    student_leader: User,
    faculty_user: User,
    innovation_project: InnovationProject,
    project_milestone: ProjectMilestone,
):
    """Test scheduling tranches and releasing them upon milestone approval."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    lead_headers = auth_headers_for(student_leader)

    # 1. Register & Verify Partner
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Godrej Industries CSR",
            "domain": "Water & Environment",
            "cin_number": "L24241MH1988PLC097781",
            "csr_budget": 18000000.00,
            "website": "https://www.godrej.com",
            "point_of_contact_name": "N. Godrej",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543222",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    # 2. Create Agreement
    agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 300000.00,
            "terms_and_conditions": "Milestone-gated grant",
        },
        headers=ind_headers,
    )
    agreement_id = agree_res.json()["data"]["id"]
    await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/approve", headers=lead_headers)

    # 3. Schedule Tranche linked to Milestone (Milestone is already APPROVED in fixture)
    tranche_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/disbursements",
        json={"tranche_number": 1, "amount": 150000.00, "milestone_id": str(project_milestone.id)},
        headers=ind_headers,
    )
    assert tranche_res.status_code == 201
    disb_id = tranche_res.json()["data"]["id"]

    # 4. Release Disbursement
    rel_res = await client.post(
        f"/api/v1/partnerships/disbursements/{disb_id}/release",
        json={"transaction_reference": "TXN-GODREJ-771122", "invoice_number": "INV-GODREJ-01"},
        headers=ind_headers,
    )
    assert rel_res.status_code == 200, rel_res.text
    assert rel_res.json()["data"]["disbursement_status"] == "RELEASED"
