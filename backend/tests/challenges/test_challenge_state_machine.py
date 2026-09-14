import pytest
from httpx import AsyncClient
from typing import Dict, Any
from app.core.constants import ChallengeStatus


@pytest.mark.asyncio
async def test_state_001_submit_draft_by_author(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """STATE-001: Citizen author transitions draft challenge to submitted."""
    # 1. Create draft
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Broken Handpump in Sector 3",
            "description": "The local community handpump has been non-functional for 3 weeks affecting 200 residents.",
            "category": "Water",
            "affected_population": 200,
            "location": {"lat": 23.34, "lng": 85.30},
            "status": "draft"
        }
    )
    assert create_res.status_code == 201
    challenge_id = create_res.json()["data"]["id"]
    version = create_res.json()["data"]["version"]

    # 2. Transition draft -> submitted
    status_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=citizen_auth["headers"],
        json={"status": "submitted", "version": version, "reason": "Completed all details"}
    )
    assert status_res.status_code == 200
    assert status_res.json()["data"]["status"] == "submitted"
    assert status_res.json()["data"]["version"] == version + 1


@pytest.mark.asyncio
async def test_state_002_submit_draft_by_non_author_forbidden(
    client: AsyncClient, citizen_auth: Dict[str, Any], citizen2_auth: Dict[str, Any]
):
    """STATE-002: Non-author citizen cannot transition another user's draft."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Broken Streetlights in Ward 7",
            "description": "Entire lane is pitch dark creating safety hazards for pedestrians at night.",
            "category": "Infrastructure",
            "affected_population": 150,
            "location": {"lat": 23.35, "lng": 85.31},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]
    version = create_res.json()["data"]["version"]

    # Citizen 2 tries to submit Citizen 1's draft
    status_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=citizen2_auth["headers"],
        json={"status": "submitted", "version": version}
    )
    assert status_res.status_code == 403


@pytest.mark.asyncio
async def test_state_003_start_review_by_evaluator(
    client: AsyncClient, citizen_auth: Dict[str, Any], evaluator_auth: Dict[str, Any]
):
    """STATE-003: Evaluator (Faculty) transitions submitted challenge to under_review."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Drainage Overflow Near Market",
            "description": "Sewage overflow causing health hazard for surrounding food stalls and shoppers.",
            "category": "Sanitation",
            "affected_population": 800,
            "location": {"lat": 23.36, "lng": 85.32},
            "status": "submitted"
        }
    )
    challenge_id = create_res.json()["data"]["id"]
    version = create_res.json()["data"]["version"]

    # Evaluator begins review
    review_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=evaluator_auth["headers"],
        json={"status": "under_review", "version": version, "reason": "Assigned to academic assessment team"}
    )
    assert review_res.status_code == 200
    assert review_res.json()["data"]["status"] == "under_review"


@pytest.mark.asyncio
async def test_state_004_citizen_cannot_review(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """STATE-004: Citizen cannot transition challenge to under_review."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Drainage Overflow Near Market",
            "description": "Sewage overflow causing health hazard for surrounding food stalls and shoppers.",
            "category": "Sanitation",
            "affected_population": 800,
            "location": {"lat": 23.36, "lng": 85.32},
            "status": "submitted"
        }
    )
    challenge_id = create_res.json()["data"]["id"]
    version = create_res.json()["data"]["version"]

    review_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=citizen_auth["headers"],
        json={"status": "under_review", "version": version}
    )
    assert review_res.status_code == 403


@pytest.mark.asyncio
async def test_state_005_full_approval_and_publish_flow(
    client: AsyncClient, citizen_auth: Dict[str, Any], evaluator_auth: Dict[str, Any], admin_auth: Dict[str, Any]
):
    """STATE-005 to 008: under_review -> approved -> published -> closed -> archived."""
    # 1. Create submitted
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Primary Health Center Lacks Power Backup",
            "description": "Vaccine refrigerators lose power frequently during power cuts lasting 6 hours.",
            "category": "Energy",
            "affected_population": 3000,
            "location": {"lat": 23.37, "lng": 85.33},
            "status": "submitted"
        }
    )
    challenge_id = create_res.json()["data"]["id"]
    v1 = create_res.json()["data"]["version"]

    # 2. submitted -> under_review (Evaluator)
    res_review = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=evaluator_auth["headers"],
        json={"status": "under_review", "version": v1}
    )
    assert res_review.status_code == 200
    v2 = res_review.json()["data"]["version"]

    # 3. under_review -> approved (Evaluator)
    res_approve = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=evaluator_auth["headers"],
        json={"status": "approved", "version": v2}
    )
    assert res_approve.status_code == 200
    v3 = res_approve.json()["data"]["version"]

    # 4. approved -> published (Admin)
    res_pub = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=admin_auth["headers"],
        json={"status": "published", "version": v3}
    )
    assert res_pub.status_code == 200
    assert res_pub.json()["data"]["published_at"] is not None
    v4 = res_pub.json()["data"]["version"]

    # 5. published -> closed (Admin)
    res_close = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=admin_auth["headers"],
        json={"status": "closed", "version": v4}
    )
    assert res_close.status_code == 200
    v5 = res_close.json()["data"]["version"]

    # 6. closed -> archived (Admin)
    res_archive = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=admin_auth["headers"],
        json={"status": "archived", "version": v5}
    )
    assert res_archive.status_code == 200
    assert res_archive.json()["data"]["archived_at"] is not None


@pytest.mark.asyncio
async def test_state_010_invalid_closed_to_draft(
    client: AsyncClient, citizen_auth: Dict[str, Any], admin_auth: Dict[str, Any]
):
    """STATE-010: Invalid transition closed -> draft is rejected with 400 Bad Request."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=admin_auth["headers"],
        json={
            "title": "Invalid Transition Test Challenge",
            "description": "Testing invalid state machine transitions according to M2 specification.",
            "category": "Water",
            "affected_population": 100,
            "location": {"lat": 23.0, "lng": 85.0},
            "status": "closed"
        }
    )
    challenge_id = create_res.json()["data"]["id"]
    version = create_res.json()["data"]["version"]

    # Attempt closed -> draft
    invalid_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=admin_auth["headers"],
        json={"status": "draft", "version": version}
    )
    assert invalid_res.status_code == 400
    assert invalid_res.json()["error"]["code"] == "INVALID_STATE_TRANSITION"


@pytest.mark.asyncio
async def test_state_011_invalid_draft_to_published(
    client: AsyncClient, admin_auth: Dict[str, Any]
):
    """STATE-011: Invalid transition draft -> published without evaluation is rejected."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=admin_auth["headers"],
        json={
            "title": "Bypass Evaluation Test Challenge",
            "description": "Testing invalid state machine transitions according to M2 specification.",
            "category": "Education",
            "affected_population": 100,
            "location": {"lat": 23.0, "lng": 85.0},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]
    version = create_res.json()["data"]["version"]

    # Attempt draft -> published
    invalid_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=admin_auth["headers"],
        json={"status": "published", "version": version}
    )
    assert invalid_res.status_code == 400
    assert invalid_res.json()["error"]["code"] == "INVALID_STATE_TRANSITION"


@pytest.mark.asyncio
async def test_state_012_invalid_terminal_transition_from_archived(
    client: AsyncClient, admin_auth: Dict[str, Any]
):
    """STATE-012: Transitioning from archived (terminal state) is rejected."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=admin_auth["headers"],
        json={
            "title": "Terminal State Test Challenge",
            "description": "Testing terminal state machine behavior according to M2 specification.",
            "category": "Healthcare",
            "affected_population": 100,
            "location": {"lat": 23.0, "lng": 85.0},
            "status": "archived"
        }
    )
    challenge_id = create_res.json()["data"]["id"]
    version = create_res.json()["data"]["version"]

    # Attempt archived -> under_review
    invalid_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=admin_auth["headers"],
        json={"status": "under_review", "version": version}
    )
    assert invalid_res.status_code == 400
    assert invalid_res.json()["error"]["code"] == "INVALID_STATE_TRANSITION"
