import pytest
from uuid import uuid4
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.user import User, UserRole
from app.models.challenge import Challenge
from app.models.team import Team
from app.models.academic import University, Department, FacultyAffiliation
from app.core.constants import UniversityStatus, AffiliationStatus


@pytest.fixture
def admin_headers(platform_admin: User) -> dict:
    token = create_access_token(
        subject=platform_admin.id,
        role=str(platform_admin.role),
        email=platform_admin.email,
        name=platform_admin.full_name,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def faculty_headers(faculty_user: User) -> dict:
    token = create_access_token(
        subject=faculty_user.id,
        role=str(faculty_user.role),
        email=faculty_user.email,
        name=faculty_user.full_name,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def second_faculty_headers(second_faculty_user: User) -> dict:
    token = create_access_token(
        subject=second_faculty_user.id,
        role=str(second_faculty_user.role),
        email=second_faculty_user.email,
        name=second_faculty_user.full_name,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def student_headers(student_user: User) -> dict:
    token = create_access_token(
        subject=student_user.id,
        role=str(student_user.role),
        email=student_user.email,
        name=student_user.full_name,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_university_api_endpoints(async_client: AsyncClient, faculty_headers, admin_headers):
    # 1. Register University
    payload = {
        "name": "Indian Institute of Technology Delhi",
        "code": "IITD",
        "district": "New Delhi",
        "state": "Delhi",
        "contact_email": "admin@iitd.ac.in",
        "domain_expertise": ["Clean Energy", "AI & Robotics"],
    }
    resp = await async_client.post("/api/v1/academic/universities", json=payload, headers=faculty_headers)
    assert resp.status_code == 201
    univ_data = resp.json()["data"]
    univ_id = univ_data["id"]
    assert univ_data["status"] == "PENDING_VERIFICATION"

    # 2. Platform Admin Verifies University
    status_payload = {"status": "VERIFIED", "version": 1}
    resp = await async_client.patch(f"/api/v1/academic/universities/{univ_id}/status", json=status_payload, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "VERIFIED"

    # 3. Create Department
    dept_payload = {
        "name": "Electrical Engineering",
        "code": "EE",
        "specializations": ["Power Systems", "Smart Grids"],
    }
    resp = await async_client.post(f"/api/v1/academic/universities/{univ_id}/departments", json=dept_payload, headers=faculty_headers)
    assert resp.status_code == 201
    dept_id = resp.json()["data"]["id"]

    # 4. List Departments
    resp = await async_client.get(f"/api/v1/academic/universities/{univ_id}/departments")
    assert resp.status_code == 200
    assert len(resp.json()["data"]["items"]) >= 1


@pytest.mark.asyncio
async def test_faculty_affiliation_and_matching_api(
    async_client: AsyncClient, faculty_headers, second_faculty_headers, admin_headers, published_challenge
):
    # Register and verify university
    resp = await async_client.post(
        "/api/v1/academic/universities",
        json={
            "name": "IIT Guwahati",
            "code": "IITG",
            "district": "Guwahati",
            "state": "Assam",
            "contact_email": "admin@iitg.ac.in",
            "domain_expertise": ["Water", "Ecology"],
        },
        headers=faculty_headers,
    )
    univ_id = resp.json()["data"]["id"]
    await async_client.patch(
        f"/api/v1/academic/universities/{univ_id}/status", json={"status": "VERIFIED", "version": 1}, headers=admin_headers
    )

    dept_resp = await async_client.post(
        f"/api/v1/academic/universities/{univ_id}/departments",
        json={"name": "Biosciences and Bioengineering", "code": "BSBE"},
        headers=faculty_headers,
    )
    dept_id = dept_resp.json()["data"]["id"]

    # Faculty affiliation request
    aff_resp = await async_client.post(
        "/api/v1/academic/affiliations",
        json={"university_id": univ_id, "department_id": dept_id, "designation": "Associate Professor"},
        headers=second_faculty_headers,
    )
    assert aff_resp.status_code == 201
    aff_id = aff_resp.json()["data"]["id"]

    # Admin verifies affiliation
    verify_resp = await async_client.post(
        f"/api/v1/academic/affiliations/{aff_id}/verify",
        json={"action": "APPROVE"},
        headers=faculty_headers,
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json()["data"]["status"] == "ACTIVE"

    # Multi-Factor Matching API
    match_resp = await async_client.get(
        f"/api/v1/academic/matching/universities/{published_challenge.id}", headers=faculty_headers
    )
    assert match_resp.status_code == 200
    assert len(match_resp.json()["data"]) >= 1
