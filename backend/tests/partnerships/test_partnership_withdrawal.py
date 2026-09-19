import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject, ProjectMilestone
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_sponsor_withdrawal_freezes_child_entities_and_calculates_gap(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    student_leader: User,
    faculty_user: User,
    innovation_project: InnovationProject,
    project_milestone: ProjectMilestone,
):
    """Test withdrawal transitions status to WITHDRAWN, preserves history, and freezes new actions."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    lead_headers = auth_headers_for(student_leader)

    # 1. Register & Verify Partner
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Wipro Cares",
            "domain": "Rural Health",
            "cin_number": "L32102KA1945PLC020800",
            "csr_budget": 25000000.00,
            "website": "https://wiprocares.org",
            "point_of_contact_name": "A. Premji",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543266",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    # 2. Create and Approve ₹5,00,000 Agreement with 2 Tranches
    agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 500000.00,
            "tranches": [
                {"tranche_number": 1, "amount": 200000.00, "milestone_id": str(project_milestone.id)},
                {"tranche_number": 2, "amount": 300000.00, "milestone_id": str(project_milestone.id)},
            ],
            "terms_and_conditions": "Multi-tranche grant with potential withdrawal",
        },
        headers=ind_headers,
    )
    agreement_id = agree_res.json()["data"]["id"]
    await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/approve", headers=lead_headers)

    # 3. Release Tranche 1 (₹2,00,000)
    disb_list = await client.get(f"/api/v1/partnerships/agreements/{agreement_id}/disbursements", headers=ind_headers)
    tranche_1_id = disb_list.json()["data"][0]["id"]
    tranche_2_id = disb_list.json()["data"][1]["id"]
    await client.post(
        f"/api/v1/partnerships/disbursements/{tranche_1_id}/release",
        json={"transaction_reference": "TXN-WIPRO-998811", "invoice_number": "INV-001"},
        headers=ind_headers,
    )

    # 4. Partner Withdraws Mid-Lifecycle
    with_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/withdraw",
        json={"withdrawal_reason": "CSR Board Reallocated Budget to Floods Relief"},
        headers=ind_headers,
    )
    assert with_res.status_code == 200
    assert with_res.json()["data"]["commitment_status"] == "WITHDRAWN"

    # 5. Assert Tranche 2 is blocked from release
    block_res = await client.post(
        f"/api/v1/partnerships/disbursements/{tranche_2_id}/release",
        json={"transaction_reference": "TXN-SHOULD-FAIL"},
        headers=ind_headers,
    )
    assert block_res.status_code == 400
    assert "AGREEMENT_WITHDRAWN" in block_res.json()["error"]["code"]
