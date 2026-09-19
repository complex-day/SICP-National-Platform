import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_m1_role_guard_blocks_student_from_registering_partner(
    client: AsyncClient,
    student_leader: User,
):
    """Test M1 IAM RBAC guard: student cannot register an enterprise partner profile."""
    lead_headers = auth_headers_for(student_leader)

    reg_payload = {
        "company_name": "Student Fake Enterprise",
        "domain": "IT",
        "cin_number": "U12345MH2025PTC123456",
        "csr_budget": 500000.00,
        "website": "https://fake.io",
        "point_of_contact_name": "Student",
        "point_of_contact_email": student_leader.email,
        "point_of_contact_phone": "+919000000000",
    }
    res = await client.post("/api/v1/partnerships/partners", json=reg_payload, headers=lead_headers)
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_m4_unauthorized_faculty_cannot_cosign(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    student_leader: User,
    innovation_project: InnovationProject,
    db_session,
):
    """Test faculty not assigned to project allocation cannot co-sign agreement."""
    from app.models.user import User
    from app.core.constants import UserRole, UserStatus
    from app.core.security import get_password_hash

    # Create unassigned faculty
    other_faculty = User(
        id=uuid4(),
        email=f"unassigned_{uuid4().hex[:6]}@otheruniv.edu",
        full_name="Dr. Unassigned Faculty",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.FACULTY,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(other_faculty)
    await db_session.commit()

    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    other_fac_headers = auth_headers_for(other_faculty)

    # Register & Verify Partner
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Cross Module Sponsor",
            "domain": "IT",
            "cin_number": "U72900DL2021PTC123456",
            "csr_budget": 5000000.00,
            "website": "https://cross.io",
            "point_of_contact_name": "Contact",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543200",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    # Create Agreement
    agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 100000.00,
            "terms_and_conditions": "Grant",
        },
        headers=ind_headers,
    )
    agreement_id = agree_res.json()["data"]["id"]

    # Unassigned faculty attempts to approve
    app_res = await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/approve", headers=other_fac_headers)
    assert app_res.status_code == 403
