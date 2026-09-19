import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_partner_suspension_during_active_agreement(
    client: AsyncClient,
    platform_admin: User,
    faculty_user: User,
    industry_user: User,
    verified_partner: dict,
    active_m5_project: InnovationProject,
):
    """
    Edge Case: Partner is suspended while having an ACTIVE agreement.
    - Historical released disbursements and completed sessions are preserved.
    - New agreement creation is blocked.
    - New tranche scheduling or disbursement releases are blocked.
    """
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    faculty_headers = auth_headers_for(faculty_user)

    # 1. Create and approve agreement while VERIFIED
    agree_payload = {
        "partner_id": verified_partner["id"],
        "project_id": str(active_m5_project.id),
        "partnership_type": "FUNDING",
        "promised_amount": 500000.00,
        "terms_and_conditions": "Active partnership grant",
    }
    create_res = await client.post("/api/v1/partnerships/agreements", json=agree_payload, headers=ind_headers)
    assert create_res.status_code == 201
    agreement_id = create_res.json()["data"]["id"]

    await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/submit", headers=ind_headers)
    await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/approve",
        json={"approval_notes": "PI approval"},
        headers=faculty_headers,
    )

    # 2. Release Tranche 1
    t1_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/disbursements",
        json={"tranche_number": 1, "amount": 200000.00, "due_date": "2026-09-30"},
        headers=ind_headers,
    )
    assert t1_res.status_code == 201
    d1_id = t1_res.json()["data"]["id"]

    await client.post(
        f"/api/v1/partnerships/disbursements/{d1_id}/release",
        json={"transaction_reference": "UTR_SUCCESS_1"},
        headers=ind_headers,
    )

    # 3. Admin SUSPENDS the partner
    suspend_res = await client.patch(
        f"/api/v1/partnerships/partners/{verified_partner['id']}/verify",
        json={"status": "SUSPENDED", "verification_notes": "Regulatory audit violation"},
        headers=admin_headers,
    )
    assert suspend_res.status_code == 200
    assert suspend_res.json()["data"]["verification_status"] == "SUSPENDED"

    # 4. Attempting to create a NEW agreement should be BLOCKED (403)
    new_agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": verified_partner["id"],
            "project_id": str(active_m5_project.id),
            "partnership_type": "MENTORSHIP",
            "promised_hours": 20,
        },
        headers=ind_headers,
    )
    assert new_agree_res.status_code == 403
    assert "UNVERIFIED_PARTNER" in new_agree_res.json()["error"]["code"] or "SUSPENDED" in new_agree_res.json()["error"]["code"]

    # 5. Attempting to schedule Tranche 2 on active agreement should be BLOCKED (403/400)
    t2_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/disbursements",
        json={"tranche_number": 2, "amount": 100000.00, "due_date": "2026-10-31"},
        headers=ind_headers,
    )
    assert t2_res.status_code in (400, 403)


@pytest.mark.asyncio
async def test_multi_sponsor_independent_coexistence(
    client: AsyncClient,
    platform_admin: User,
    faculty_user: User,
    industry_user: User,
    verified_partner: dict,
    active_m5_project: InnovationProject,
):
    """
    Edge Case: M:N Cardinality - Multiple independent industry sponsors backing the same project.
    """
    ind1_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    faculty_headers = auth_headers_for(faculty_user)

    # Register Sponsor 2
    ind2_user = User(
        id=uuid4(),
        email=f"sponsor2_{uuid4().hex[:6]}@infosys.com",
        full_name="Infosys CSR Lead",
        role="industry",
        status="ACTIVE",
        is_verified=True,
    )
    # Register and verify Partner 2
    p2_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Infosys Foundation",
            "domain": "Software & AI",
            "cin_number": "L85110KA1981PLC013115",
            "csr_budget": 30000000.0,
            "website": "https://www.infosys.org",
            "point_of_contact_name": "Sudha Rao",
            "point_of_contact_email": ind2_user.email,
        },
        headers=admin_headers,
    )
    p2_id = p2_res.json()["data"]["id"]
    await client.patch(
        f"/api/v1/partnerships/partners/{p2_id}/verify",
        json={"status": "VERIFIED", "verification_notes": "Verified MCA"},
        headers=admin_headers,
    )

    # Agreement 1: Partner 1 pledges ₹5,00,000 funding
    a1_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": verified_partner["id"],
            "project_id": str(active_m5_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 500000.00,
        },
        headers=ind1_headers,
    )
    a1_id = a1_res.json()["data"]["id"]
    await client.post(f"/api/v1/partnerships/agreements/{a1_id}/submit", headers=ind1_headers)
    await client.post(
        f"/api/v1/partnerships/agreements/{a1_id}/approve",
        json={"approval_notes": "Approved sponsor 1"},
        headers=faculty_headers,
    )

    # Agreement 2: Partner 2 pledges ₹3,00,000 funding + 40 mentorship hours
    a2_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": p2_id,
            "project_id": str(active_m5_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 300000.00,
            "promised_hours": 40,
        },
        headers=admin_headers,
    )
    a2_id = a2_res.json()["data"]["id"]
    await client.post(f"/api/v1/partnerships/agreements/{a2_id}/submit", headers=admin_headers)
    await client.post(
        f"/api/v1/partnerships/agreements/{a2_id}/approve",
        json={"approval_notes": "Approved sponsor 2"},
        headers=faculty_headers,
    )

    # Check Project Coverage: Combined ₹8,00,000 funding across 2 distinct sponsors
    cov_res = await client.get(
        f"/api/v1/partnerships/projects/{active_m5_project.id}/coverage",
        headers=faculty_headers,
    )
    assert cov_res.status_code == 200
    cov = cov_res.json()["data"]
    assert cov["total_funding_promised"] == 800000.00
    assert cov["total_mentorship_hours_promised"] == 40
    assert cov["sponsor_count"] == 2
