import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_corporate_mentorship_logging_and_verification(
    client: AsyncClient,
    industry_user: User,
    corporate_mentor_user: User,
    platform_admin: User,
    student_leader: User,
    innovation_project: InnovationProject,
):
    """Test mentor logs session, team verifies hours, rating is captured as analytics."""
    ind_headers = auth_headers_for(industry_user)
    mentor_headers = auth_headers_for(corporate_mentor_user)
    admin_headers = auth_headers_for(platform_admin)
    lead_headers = auth_headers_for(student_leader)

    # 1. Register & Verify Partner
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Intel Labs India",
            "domain": "Semiconductors & Embedded Edge AI",
            "cin_number": "U72200KA1998PTC023778",
            "csr_budget": 20000000.00,
            "website": "https://www.intel.in",
            "point_of_contact_name": "Ananya Deshmukh",
            "point_of_contact_email": corporate_mentor_user.email,
            "point_of_contact_phone": "+919876543219",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]
    await client.patch(f"/api/v1/partnerships/partners/{partner_id}/verify", json={"status": "VERIFIED"}, headers=admin_headers)

    # 2. Create and Approve Mentorship Agreement (30 Hours)
    agree_res = await client.post(
        "/api/v1/partnerships/agreements",
        json={
            "partner_id": partner_id,
            "project_id": str(innovation_project.id),
            "partnership_type": "MENTORSHIP",
            "mentor_user_id": str(corporate_mentor_user.id),
            "promised_hours": 30,
            "terms_and_conditions": "30 hours corporate embedded systems mentoring",
        },
        headers=ind_headers,
    )
    agreement_id = agree_res.json()["data"]["id"]
    await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/approve", headers=lead_headers)

    # 3. Mentor logs session (2.5 hours)
    sess_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/sessions",
        json={
            "mentor_user_id": str(corporate_mentor_user.id),
            "session_date": "2026-10-10T14:00:00Z",
            "duration_hours": 2.5,
            "topics_covered": "Edge compute optimization for telemetry probes",
        },
        headers=mentor_headers,
    )
    assert sess_res.status_code == 201
    session_id = sess_res.json()["data"]["id"]

    # 4. Student Lead verifies session and provides optional 5-star rating
    ver_res = await client.patch(
        f"/api/v1/partnerships/sessions/{session_id}/verify",
        json={"status": "VERIFIED", "student_rating": 5, "feedback": "Super helpful feedback on power consumption."},
        headers=lead_headers,
    )
    assert ver_res.status_code == 200
    assert ver_res.json()["data"]["status"] == "VERIFIED"

    # 5. Check Agreement completed hours updated to 2.5
    ag_check = await client.get(f"/api/v1/partnerships/agreements/{agreement_id}", headers=lead_headers)
    assert ag_check.json()["data"]["completed_hours"] == 2.5
