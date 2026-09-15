import pytest
from uuid import uuid4
from httpx import AsyncClient

from app.core.security import create_access_token
from app.models.user import User
from app.models.challenge import Challenge
from app.models.team import Team


@pytest.mark.asyncio
async def test_academic_collaboration_e2e(
    async_client: AsyncClient,
    platform_admin: User,
    faculty_user: User,
    second_faculty_user: User,
    student_user: User,
    published_challenge: Challenge,
    student_team: Team,
):
    admin_token = create_access_token(subject=platform_admin.id, role=str(platform_admin.role), email=platform_admin.email, name=platform_admin.full_name)
    faculty_token = create_access_token(subject=faculty_user.id, role=str(faculty_user.role), email=faculty_user.email, name=faculty_user.full_name)
    second_faculty_token = create_access_token(subject=second_faculty_user.id, role=str(second_faculty_user.role), email=second_faculty_user.email, name=second_faculty_user.full_name)

    admin_h = {"Authorization": f"Bearer {admin_token}"}
    faculty_h = {"Authorization": f"Bearer {faculty_token}"}
    second_faculty_h = {"Authorization": f"Bearer {second_faculty_token}"}

    # Step 1: Faculty member registers university
    reg_resp = await async_client.post(
        "/api/v1/academic/universities",
        json={
            "name": "Vellore Institute of Technology",
            "code": "VIT",
            "district": "Vellore",
            "state": "Tamil Nadu",
            "contact_email": "admin@vit.ac.in",
            "domain_expertise": ["Water", "Embedded Systems", "AgroTech"],
        },
        headers=faculty_h,
    )
    assert reg_resp.status_code == 201
    univ_id = reg_resp.json()["data"]["id"]

    # Step 2: Platform Admin verifies university
    status_resp = await async_client.patch(
        f"/api/v1/academic/universities/{univ_id}/status",
        json={"status": "VERIFIED", "version": 1},
        headers=admin_h,
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["data"]["status"] == "VERIFIED"

    # Step 3: University Admin creates Department
    dept_resp = await async_client.post(
        f"/api/v1/academic/universities/{univ_id}/departments",
        json={"name": "Environmental & Water Resources", "code": "EWR"},
        headers=faculty_h,
    )
    assert dept_resp.status_code == 201
    dept_id = dept_resp.json()["data"]["id"]

    # Step 4: Second Faculty requests affiliation
    aff_resp = await async_client.post(
        "/api/v1/academic/affiliations",
        json={"university_id": univ_id, "department_id": dept_id, "designation": "Professor"},
        headers=second_faculty_h,
    )
    assert aff_resp.status_code == 201
    aff_id = aff_resp.json()["data"]["id"]

    # Step 5: University Admin approves affiliation
    verify_resp = await async_client.post(
        f"/api/v1/academic/affiliations/{aff_id}/verify",
        json={"action": "APPROVE"},
        headers=faculty_h,
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json()["data"]["status"] == "ACTIVE"

    # Step 6: Query Multi-Factor Matching for published challenge
    match_resp = await async_client.get(
        f"/api/v1/academic/matching/universities/{published_challenge.id}",
        headers=faculty_h,
    )
    assert match_resp.status_code == 200
    assert len(match_resp.json()["data"]) >= 1

    # Step 7: University claims published challenge
    claim_resp = await async_client.post(
        "/api/v1/academic/intakes/claim",
        json={"challenge_id": str(published_challenge.id), "university_id": univ_id},
        headers=faculty_h,
    )
    assert claim_resp.status_code == 201
    intake_id = claim_resp.json()["data"]["id"]

    # Step 8: University allocates student team & faculty mentor
    alloc_resp = await async_client.post(
        f"/api/v1/academic/intakes/{intake_id}/allocations",
        json={
            "team_id": str(student_team.id),
            "department_id": dept_id,
            "faculty_mentor_id": str(second_faculty_user.id),
        },
        headers=faculty_h,
    )
    assert alloc_resp.status_code == 201
    alloc_data = alloc_resp.json()["data"]
    assert alloc_data["team_id"] == str(student_team.id)
    assert alloc_data["faculty_mentor_id"] == str(second_faculty_user.id)
