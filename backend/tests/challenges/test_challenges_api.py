import pytest
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.asyncio
async def test_chal_api_001_submit_challenge_citizen(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """CHAL-API-001: Citizen submits challenge with 201 Created and standard envelope."""
    payload = {
        "title": "Severe Arsenic Contamination in Borewell",
        "description": "Lab reports confirm arsenic levels 5x over WHO permissible limits across 3 villages.",
        "category": "Water",
        "subcategory": "Chemical Contamination",
        "affected_population": 1200,
        "location": {
            "lat": 23.51,
            "lng": 85.47,
            "address_text": "Borewell 3, Block B",
            "district": "Ranchi",
            "state": "Jharkhand"
        }
    }
    response = await client.post("/api/v1/challenges", headers=citizen_auth["headers"], json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "id" in data["data"]
    assert data["data"]["title"] == payload["title"]
    assert data["data"]["category"] == "Water"
    assert data["data"]["status"] == "draft"


@pytest.mark.asyncio
async def test_chal_api_002_submit_challenge_anonymous(client: AsyncClient):
    """CHAL-API-002: Anonymous request rejected with 401 Unauthorized."""
    response = await client.post("/api/v1/challenges", json={
        "title": "Anonymous Submission Attempt",
        "description": "Detailed description satisfying all length constraints for challenge creation tests.",
        "category": "Water",
        "affected_population": 100,
        "location": {"lat": 23.0, "lng": 85.0}
    })
    assert response.status_code == 401
    assert response.json()["success"] is False
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_chal_api_006_get_challenge_by_id(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """CHAL-API-006: Retrieve challenge details by UUID."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Retrieval Test Challenge",
            "description": "Detailed description satisfying all length constraints for challenge creation tests.",
            "category": "Education",
            "affected_population": 250,
            "location": {"lat": 23.52, "lng": 85.48},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]

    get_res = await client.get(f"/api/v1/challenges/{challenge_id}", headers=citizen_auth["headers"])
    assert get_res.status_code == 200
    data = get_res.json()["data"]
    assert data["id"] == challenge_id
    assert data["title"] == "Retrieval Test Challenge"
    assert "assets" in data


@pytest.mark.asyncio
async def test_chal_api_007_get_challenge_not_found(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """CHAL-API-007: Non-existent UUID returns 404 Not Found."""
    fake_uuid = "00000000-0000-0000-0000-000000000000"
    get_res = await client.get(f"/api/v1/challenges/{fake_uuid}", headers=citizen_auth["headers"])
    assert get_res.status_code == 404
    assert get_res.json()["error"]["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_chal_api_008_list_challenges_pagination(client: AsyncClient, admin_auth: Dict[str, Any]):
    """CHAL-API-008: List challenges with pagination and filters."""
    # Seed 3 challenges
    for i in range(3):
        await client.post(
            "/api/v1/challenges",
            headers=admin_auth["headers"],
            json={
                "title": f"Seed Challenge {i} for Catalog Listing",
                "description": "Detailed description satisfying all length constraints for challenge creation tests.",
                "category": "Water" if i % 2 == 0 else "Healthcare",
                "affected_population": 100 * (i + 1),
                "location": {"lat": 23.50 + i * 0.01, "lng": 85.40 + i * 0.01},
                "status": "published"
            }
        )

    list_res = await client.get("/api/v1/challenges?page=1&limit=2&status=published", headers=admin_auth["headers"])
    assert list_res.status_code == 200
    data = list_res.json()["data"]
    assert len(data["items"]) <= 2
    assert "pagination" in data
    assert data["pagination"]["page"] == 1


@pytest.mark.asyncio
async def test_chal_api_010_my_challenges(
    client: AsyncClient, citizen_auth: Dict[str, Any], citizen2_auth: Dict[str, Any]
):
    """CHAL-API-010: /my-challenges returns only the authenticated user's challenges."""
    # Citizen 1 creates 2 challenges
    for i in range(2):
        await client.post(
            "/api/v1/challenges",
            headers=citizen_auth["headers"],
            json={
                "title": f"Citizen 1 Personal Challenge {i}",
                "description": "Detailed description satisfying all length constraints for challenge creation tests.",
                "category": "Agriculture",
                "affected_population": 150,
                "location": {"lat": 23.55, "lng": 85.49}
            }
        )

    # Citizen 2 creates 1 challenge
    await client.post(
        "/api/v1/challenges",
        headers=citizen2_auth["headers"],
        json={
            "title": "Citizen 2 Personal Challenge",
            "description": "Detailed description satisfying all length constraints for challenge creation tests.",
            "category": "Sanitation",
            "affected_population": 90,
            "location": {"lat": 23.56, "lng": 85.50}
        }
    )

    my_res = await client.get("/api/v1/challenges/my-challenges", headers=citizen_auth["headers"])
    assert my_res.status_code == 200
    items = my_res.json()["data"]["items"]
    assert len(items) >= 2
    for item in items:
        assert item["created_by"] == citizen_auth["user_id"]
