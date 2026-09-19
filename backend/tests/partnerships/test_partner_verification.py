import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from app.models.user import User
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_partner_registration_and_verification_flow(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
):
    """Test enterprise profile registration and admin accreditation verification."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)

    # 1. Industry User registers enterprise partner profile
    reg_payload = {
        "company_name": "Tata Consultancy Services CSR Foundation",
        "domain": "Information Technology & Rural Telemetry",
        "cin_number": "L22210MH1995PLC084781",
        "csr_budget": 50000000.00,
        "website": "https://www.tcs.com/csr",
        "point_of_contact_name": "Vikramaditya Rao",
        "point_of_contact_email": industry_user.email,
        "point_of_contact_phone": "+919876543210",
    }
    res = await client.post("/api/v1/partnerships/partners", json=reg_payload, headers=ind_headers)
    assert res.status_code == 201, res.text
    data = res.json()["data"]
    partner_id = data["id"]
    assert data["verification_status"] == "PENDING_VERIFICATION"

    # 2. Platform Admin verifies accreditation
    verify_res = await client.patch(
        f"/api/v1/partnerships/partners/{partner_id}/verify",
        json={"status": "VERIFIED", "verification_notes": "CIN and CSR-1 registration verified on MCA portal."},
        headers=admin_headers,
    )
    assert verify_res.status_code == 200, verify_res.text
    assert verify_res.json()["data"]["verification_status"] == "VERIFIED"


@pytest.mark.asyncio
async def test_unverified_partner_cannot_submit_proposal(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
):
    """Test unverified partner cannot create agreements."""
    ind_headers = auth_headers_for(industry_user)

    reg_payload = {
        "company_name": "Unverified Tech Startup",
        "domain": "Hardware",
        "cin_number": "U72900MH2024PTC123456",
        "csr_budget": 1000000.00,
        "website": "https://unverified.io",
        "point_of_contact_name": "John Doe",
        "point_of_contact_email": industry_user.email,
        "point_of_contact_phone": "+919999999999",
    }
    res = await client.post("/api/v1/partnerships/partners", json=reg_payload, headers=ind_headers)
    assert res.status_code == 201
    partner_id = res.json()["data"]["id"]

    # Attempt to create agreement while PENDING_VERIFICATION
    agree_payload = {
        "partner_id": partner_id,
        "project_id": str(uuid4()),
        "partnership_type": "FUNDING",
        "promised_amount": 100000.00,
        "terms_and_conditions": "Seed grant",
    }
    agree_res = await client.post("/api/v1/partnerships/agreements", json=agree_payload, headers=ind_headers)
    assert agree_res.status_code == 403, agree_res.text
    assert "UNVERIFIED_PARTNER" in agree_res.json()["error"]["code"]
