import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_equipment_manifest_delivery_and_receipt_hash(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    student_leader: User,
    faculty_user: User,
    innovation_project: InnovationProject,
):
    """Test itemized equipment delivery confirmation."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    lead_headers = auth_headers_for(student_leader)

    # 1. Register & Verify Partner
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Qualcomm India CSR",
            "domain": "Wireless IoT",
            "cin_number": "U64202DL1996PTC077284",
            "csr_budget": 35000000.00,
            "website": "https://www.qualcomm.com",
            "point_of_contact_name": "R. Sharma",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543209",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    # 2. Create Equipment Agreement
    agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "EQUIPMENT",
            "equipment_details": [
                {"item_name": "Qualcomm Cellular IoT Dev Kits", "quantity": 5, "estimated_value": 75000.00}
            ],
            "terms_and_conditions": "5x dev kit hardware grant",
        },
        headers=ind_headers,
    )
    agreement_id = agree_res.json()["data"]["id"]
    await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/approve", headers=lead_headers)

    # 3. Confirm Delivery
    deliv_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/equipment-delivery",
        json={
            "item_name": "Qualcomm Cellular IoT Dev Kits",
            "quantity": 5,
            "receipt_reference": "REC-QC-998811",
            "receipt_checksum": "a" * 64,
        },
        headers=lead_headers,
    )
    assert deliv_res.status_code == 200
    assert deliv_res.json()["data"]["commitment_status"] == "FULFILLED"
