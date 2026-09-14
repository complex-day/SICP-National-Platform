import pytest
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.asyncio
async def test_auth_mat_001_citizen_can_create(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """AUTH-MAT-001: Citizen can create challenges."""
    res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Flooding in Low-Lying Area",
            "description": "Monsoon flooding blocks the main approach road for over 300 families.",
            "category": "Environment",
            "affected_population": 300,
            "location": {"lat": 23.38, "lng": 85.34}
        }
    )
    assert res.status_code == 201
    assert res.json()["success"] is True
    assert res.json()["data"]["created_by"] == citizen_auth["user_id"]


@pytest.mark.asyncio
async def test_auth_mat_002_student_cannot_create(client: AsyncClient, student_auth: Dict[str, Any]):
    """AUTH-MAT-002: Student cannot create challenges."""
    res = await client.post(
        "/api/v1/challenges",
        headers=student_auth["headers"],
        json={
            "title": "Student Challenge Submission",
            "description": "Student attempting to submit a challenge without citizen role permission.",
            "category": "Education",
            "affected_population": 50,
            "location": {"lat": 23.38, "lng": 85.34}
        }
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_auth_mat_003_citizen_cannot_edit_others(
    client: AsyncClient, citizen_auth: Dict[str, Any], citizen2_auth: Dict[str, Any]
):
    """AUTH-MAT-003: Citizen cannot edit another user's challenge."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Damaged Footbridge in Village",
            "description": "The wooden planks are broken, making school commute hazardous for children.",
            "category": "Infrastructure",
            "affected_population": 120,
            "location": {"lat": 23.39, "lng": 85.35},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]
    version = create_res.json()["data"]["version"]

    # Citizen 2 attempts to edit Citizen 1's challenge
    edit_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}",
        headers=citizen2_auth["headers"],
        json={
            "title": "Tampered Title by Unauthorized User",
            "version": version
        }
    )
    assert edit_res.status_code == 403


@pytest.mark.asyncio
async def test_auth_mat_004_citizen_can_edit_own_draft(
    client: AsyncClient, citizen_auth: Dict[str, Any]
):
    """AUTH-MAT-004: Citizen can edit their own draft challenge."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Draft Footbridge Report",
            "description": "Initial draft description with sufficient length to satisfy minimum requirements.",
            "category": "Infrastructure",
            "affected_population": 120,
            "location": {"lat": 23.39, "lng": 85.35},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]
    version = create_res.json()["data"]["version"]

    edit_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}",
        headers=citizen_auth["headers"],
        json={
            "title": "Updated Complete Footbridge Report Title",
            "version": version
        }
    )
    assert edit_res.status_code == 200
    assert edit_res.json()["data"]["title"] == "Updated Complete Footbridge Report Title"
    assert edit_res.json()["data"]["version"] == version + 1


@pytest.mark.asyncio
async def test_auth_mat_010_student_cannot_view_unpublished_draft(
    client: AsyncClient, citizen_auth: Dict[str, Any], student_auth: Dict[str, Any]
):
    """AUTH-MAT-010: Student cannot view another user's private draft."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Private Draft Challenge",
            "description": "Private draft description with sufficient length to satisfy minimum requirements.",
            "category": "Agriculture",
            "affected_population": 80,
            "location": {"lat": 23.40, "lng": 85.36},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]

    view_res = await client.get(
        f"/api/v1/challenges/{challenge_id}",
        headers=student_auth["headers"]
    )
    assert view_res.status_code in (403, 404)


@pytest.mark.asyncio
async def test_auth_mat_011_student_can_view_published(
    client: AsyncClient, admin_auth: Dict[str, Any], student_auth: Dict[str, Any]
):
    """AUTH-MAT-011: Student can view open published challenges."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=admin_auth["headers"],
        json={
            "title": "Public Published Challenge for Research",
            "description": "Open public challenge description for academic research and student innovation teams.",
            "category": "Water",
            "affected_population": 2500,
            "location": {"lat": 23.41, "lng": 85.37},
            "status": "published"
        }
    )
    challenge_id = create_res.json()["data"]["id"]

    view_res = await client.get(
        f"/api/v1/challenges/{challenge_id}",
        headers=student_auth["headers"]
    )
    assert view_res.status_code == 200
    assert view_res.json()["data"]["title"] == "Public Published Challenge for Research"


@pytest.mark.asyncio
async def test_auth_mat_012_citizen_can_soft_delete_own_draft(
    client: AsyncClient, citizen_auth: Dict[str, Any]
):
    """AUTH-MAT-012: Citizen can soft delete their own draft."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Accidental Draft to Delete",
            "description": "Accidental draft description with sufficient length to satisfy minimum requirements.",
            "category": "Sanitation",
            "affected_population": 40,
            "location": {"lat": 23.42, "lng": 85.38},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]

    del_res = await client.delete(
        f"/api/v1/challenges/{challenge_id}",
        headers=citizen_auth["headers"]
    )
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True
