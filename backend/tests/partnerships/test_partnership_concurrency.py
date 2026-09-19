import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject, ProjectMilestone
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_optimistic_locking_concurrency_conflict(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    innovation_project: InnovationProject,
):
    """Test concurrent stale updates are rejected via version checking."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)

    # 1. Setup Partner
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Hero MotoCorp CSR",
            "domain": "Mobility",
            "cin_number": "L35911DL1984PLC017354",
            "csr_budget": 15000000.00,
            "website": "https://www.heromotocorp.com",
            "point_of_contact_name": "P. Munjal",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543255",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    # 2. Create Agreement (Initial Version = 1)
    agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 300000.00,
            "terms_and_conditions": "Initial draft terms",
        },
        headers=ind_headers,
    )
    agreement_id = agree_res.json()["data"]["id"]

    # 3. Client A updates terms with Version 1 -> Version becomes 2
    update_a = await client.patch(
        f"/api/v1/partnerships/agreements/{agreement_id}",
        json={"terms_and_conditions": "Updated terms by Client A", "version": 1},
        headers=ind_headers,
    )
    assert update_a.status_code == 200
    assert update_a.json()["data"]["version"] == 2

    # 4. Client B attempts update using stale Version 1 -> Rejected with 409 Conflict
    update_b = await client.patch(
        f"/api/v1/partnerships/agreements/{agreement_id}",
        json={"terms_and_conditions": "Conflicting terms by Client B", "version": 1},
        headers=ind_headers,
    )
    assert update_b.status_code == 409
    assert "OPTIMISTIC_LOCK_ERROR" in update_b.json()["error"]["code"]
