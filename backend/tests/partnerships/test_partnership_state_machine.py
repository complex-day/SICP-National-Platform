import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_partnership_agreement_lifecycle_transitions(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    student_leader: User,
    faculty_user: User,
    innovation_project: InnovationProject,
):
    """Test valid lifecycle flow: PROPOSED -> APPROVED -> ACTIVE -> FULFILLED."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    lead_headers = auth_headers_for(student_leader)

    # 1. Setup Partner
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "L&T Technology Services CSR",
            "domain": "Industrial IoT",
            "cin_number": "L72900MH2012PLC232169",
            "csr_budget": 30000000.00,
            "website": "https://www.ltts.com",
            "point_of_contact_name": "K. Murthy",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543288",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    # 2. PROPOSED
    agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "EQUIPMENT",
            "equipment_details": [
                {"item_name": "LoRaWAN Gateway", "quantity": 2, "estimated_value": 40000.00}
            ],
            "terms_and_conditions": "Equipment grant terms",
        },
        headers=ind_headers,
    )
    assert agree_res.status_code == 201
    agreement_id = agree_res.json()["data"]["id"]
    assert agree_res.json()["data"]["commitment_status"] == "PROPOSED"

    # 3. PROPOSED -> APPROVED & ACTIVE
    app_res = await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/approve", headers=lead_headers)
    assert app_res.status_code == 200
    assert app_res.json()["data"]["commitment_status"] in ["APPROVED", "ACTIVE"]

    # 4. Delivery confirmation -> FULFILLED
    deliv_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/equipment-delivery",
        json={"item_name": "LoRaWAN Gateway", "quantity": 2, "receipt_reference": "REC-LTTS-90812"},
        headers=lead_headers,
    )
    assert deliv_res.status_code == 200
    assert deliv_res.json()["data"]["commitment_status"] == "FULFILLED"


@pytest.mark.asyncio
async def test_invalid_state_transitions_rejected(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    innovation_project: InnovationProject,
):
    """Test invalid direct transitions are rejected."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)

    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Tech Corp",
            "domain": "Sensors",
            "cin_number": "U72900MH2020PTC333444",
            "csr_budget": 5000000.00,
            "website": "https://techcorp.org",
            "point_of_contact_name": "S. Gupta",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543277",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 200000.00,
            "terms_and_conditions": "Invalid jump test",
        },
        headers=ind_headers,
    )
    agreement_id = agree_res.json()["data"]["id"]

    # Attempt direct PROPOSED -> FULFILLED without approval
    jump_res = await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/fulfill", headers=admin_headers)
    assert jump_res.status_code == 400
