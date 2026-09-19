import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_partner_verification_rbac(
    client: AsyncClient,
    platform_admin: User,
    faculty_user: User,
    student_leader: User,
    industry_user: User,
    verified_partner: dict,
):
    """Test RBAC on Partner verification endpoint - only ADMIN is authorized."""
    partner_id = verified_partner["id"]
    verify_payload = {
        "status": "SUSPENDED",
        "verification_notes": "Compliance review triggered suspension.",
    }

    # 1. Student cannot verify or suspend partner
    res_student = await client.patch(
        f"/api/v1/partnerships/partners/{partner_id}/verify",
        json=verify_payload,
        headers=auth_headers_for(student_leader),
    )
    assert res_student.status_code == 403

    # 2. Faculty cannot verify or suspend partner
    res_faculty = await client.patch(
        f"/api/v1/partnerships/partners/{partner_id}/verify",
        json=verify_payload,
        headers=auth_headers_for(faculty_user),
    )
    assert res_faculty.status_code == 403

    # 3. Industry user cannot verify themselves
    res_ind = await client.patch(
        f"/api/v1/partnerships/partners/{partner_id}/verify",
        json=verify_payload,
        headers=auth_headers_for(industry_user),
    )
    assert res_ind.status_code == 403

    # 4. Admin succeeds
    res_admin = await client.patch(
        f"/api/v1/partnerships/partners/{partner_id}/verify",
        json=verify_payload,
        headers=auth_headers_for(platform_admin),
    )
    assert res_admin.status_code == 200
    assert res_admin.json()["data"]["verification_status"] == "SUSPENDED"


@pytest.mark.asyncio
async def test_agreement_approval_rbac(
    client: AsyncClient,
    platform_admin: User,
    faculty_user: User,
    student_leader: User,
    student_member: User,
    industry_user: User,
    verified_partner: dict,
    active_m5_project: InnovationProject,
):
    """Test RBAC on Agreement Approval - only Project Supervising Faculty / Admin can approve."""
    ind_headers = auth_headers_for(industry_user)

    # 1. Create agreement in SUBMITTED state
    agree_payload = {
        "partner_id": verified_partner["id"],
        "project_id": str(active_m5_project.id),
        "partnership_type": "FUNDING",
        "promised_amount": 250000.00,
        "terms_and_conditions": "Funding support terms",
    }
    create_res = await client.post("/api/v1/partnerships/agreements", json=agree_payload, headers=ind_headers)
    assert create_res.status_code == 201, create_res.text
    agreement_id = create_res.json()["data"]["id"]

    submit_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/submit",
        headers=ind_headers,
    )
    assert submit_res.status_code == 200

    # 2. Student member cannot approve
    res_member = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/approve",
        json={"approval_notes": "Student member trying to approve"},
        headers=auth_headers_for(student_member),
    )
    assert res_member.status_code == 403

    # 3. Industry sponsor cannot approve their own submitted agreement
    res_sponsor = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/approve",
        json={"approval_notes": "Sponsor approving own proposal"},
        headers=auth_headers_for(industry_user),
    )
    assert res_sponsor.status_code == 403

    # 4. Supervising Faculty can approve
    res_faculty = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/approve",
        json={"approval_notes": "Approved by supervising PI."},
        headers=auth_headers_for(faculty_user),
    )
    assert res_faculty.status_code == 200
    assert res_faculty.json()["data"]["status"] == "APPROVED"


@pytest.mark.asyncio
async def test_disbursement_release_rbac(
    client: AsyncClient,
    platform_admin: User,
    faculty_user: User,
    student_leader: User,
    industry_user: User,
    verified_partner: dict,
    active_m5_project: InnovationProject,
):
    """Test RBAC on Disbursement Release - only Industry Partner or Admin can release funds."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    faculty_headers = auth_headers_for(faculty_user)
    student_headers = auth_headers_for(student_leader)

    # 1. Create and approve funding agreement
    agree_payload = {
        "partner_id": verified_partner["id"],
        "project_id": str(active_m5_project.id),
        "partnership_type": "FUNDING",
        "promised_amount": 500000.00,
        "terms_and_conditions": "Multi-tranche grant",
    }
    c_res = await client.post("/api/v1/partnerships/agreements", json=agree_payload, headers=ind_headers)
    agreement_id = c_res.json()["data"]["id"]

    await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/submit", headers=ind_headers)
    await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/approve",
        json={"approval_notes": "Approved"},
        headers=faculty_headers,
    )

    # 2. Schedule tranche
    tranche_payload = {
        "tranche_number": 1,
        "amount": 200000.00,
        "due_date": "2026-10-31",
    }
    t_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/disbursements",
        json=tranche_payload,
        headers=ind_headers,
    )
    assert t_res.status_code == 201
    disbursement_id = t_res.json()["data"]["id"]

    # 3. Student cannot release funds
    res_student = await client.post(
        f"/api/v1/partnerships/disbursements/{disbursement_id}/release",
        json={"transaction_reference": "TXN_STUDENT_FAIL"},
        headers=student_headers,
    )
    assert res_student.status_code == 403

    # 4. Faculty cannot release funds (faculty confirms receipt/milestone, but does not execute financial release)
    res_fac = await client.post(
        f"/api/v1/partnerships/disbursements/{disbursement_id}/release",
        json={"transaction_reference": "TXN_FAC_FAIL"},
        headers=faculty_headers,
    )
    assert res_fac.status_code == 403

    # 5. Industry Partner releases funds
    res_rel = await client.post(
        f"/api/v1/partnerships/disbursements/{disbursement_id}/release",
        json={"transaction_reference": "UTR_TCS_20260919_99182"},
        headers=ind_headers,
    )
    assert res_rel.status_code == 200
    assert res_rel.json()["data"]["status"] == "RELEASED"
