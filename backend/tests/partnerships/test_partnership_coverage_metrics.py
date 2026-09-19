import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_dynamic_sponsorship_coverage_and_gap_query(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    student_leader: User,
    innovation_project: InnovationProject,
):
    """Test dynamic query-time calculation of project funding coverage % and gap."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    lead_headers = auth_headers_for(student_leader)

    # 1. Register & Verify Partner A
    reg_a = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Bajaj Auto CSR",
            "domain": "Rural Engineering",
            "cin_number": "L65993PN2007PLC130076",
            "csr_budget": 12000000.00,
            "website": "https://www.bajajauto.com",
            "point_of_contact_name": "R. Bajaj",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543233",
        },
        headers=ind_headers,
    )
    partner_a_id = reg_a.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_a_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    # 2. Partner A creates ₹4,00,000 active agreement
    agree_a = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_a_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "FUNDING",
            "promised_amount": 400000.00,
            "terms_and_conditions": "Co-funding grant A",
        },
        headers=ind_headers,
    )
    agree_a_id = agree_a.json()["data"]["id"]
    await client.post(f"/api/v1/partnerships/agreements/{agree_a_id}/approve", headers=lead_headers)

    # 3. Query Project Coverage (Assume target budget is ₹10,00,000)
    cov_res = await client.get(f"/api/v1/partnerships/projects/{innovation_project.id}/coverage?target_budget=1000000.00", headers=ind_headers)
    assert cov_res.status_code == 200
    data = cov_res.json()["data"]
    assert data["funding_coverage_percentage"] == 40.0
    assert data["funding_gap"] == 600000.00
    assert data["active_sponsors_count"] >= 1
