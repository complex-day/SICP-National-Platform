import pytest
import io
import asyncio
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.asyncio
async def test_conc_001_optimistic_locking_conflict(
    client: AsyncClient, citizen_auth: Dict[str, Any]
):
    """CONC-001: Simultaneous updates with identical expected version raise 409 Conflict."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Initial Concurrency Test Title",
            "description": "Initial description with sufficient length to pass the 30 character validation rule.",
            "category": "Water",
            "affected_population": 500,
            "location": {"lat": 23.47, "lng": 85.43},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]
    version = create_res.json()["data"]["version"]

    # First update succeeds
    res1 = await client.patch(
        f"/api/v1/challenges/{challenge_id}",
        headers=citizen_auth["headers"],
        json={"title": "Updated by Client A Successfully", "version": version}
    )
    assert res1.status_code == 200
    assert res1.json()["data"]["version"] == version + 1

    # Second update using stale version fails with 409 Conflict
    res2 = await client.patch(
        f"/api/v1/challenges/{challenge_id}",
        headers=citizen_auth["headers"],
        json={"title": "Updated by Client B with Stale Version", "version": version}
    )
    assert res2.status_code == 409
    assert res2.json()["error"]["code"] == "CONCURRENCY_CONFLICT"


@pytest.mark.asyncio
async def test_conc_002_double_submission_prevention(
    client: AsyncClient, citizen_auth: Dict[str, Any]
):
    """CONC-002: Double submission with identical Idempotency-Key returns existing challenge."""
    idempotency_key = "test-idem-key-12345"
    payload = {
        "title": "Idempotent Challenge Submission Test",
        "description": "Testing double submission prevention via Idempotency-Key HTTP header.",
        "category": "Healthcare",
        "affected_population": 400,
        "location": {"lat": 23.48, "lng": 85.44}
    }

    # Request 1
    res1 = await client.post(
        "/api/v1/challenges",
        headers={**citizen_auth["headers"], "Idempotency-Key": idempotency_key},
        json=payload
    )
    assert res1.status_code in (200, 201)
    id1 = res1.json()["data"]["id"]

    # Request 2 with same idempotency key
    res2 = await client.post(
        "/api/v1/challenges",
        headers={**citizen_auth["headers"], "Idempotency-Key": idempotency_key},
        json=payload
    )
    assert res2.status_code in (200, 201)
    id2 = res2.json()["data"]["id"]

    # Must return identical challenge
    assert id1 == id2


@pytest.mark.asyncio
async def test_conc_003_concurrent_asset_limit(
    client: AsyncClient, citizen_auth: Dict[str, Any]
):
    """CONC-003: Max 5 assets limit is strictly enforced."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Asset Limit Test Challenge",
            "description": "Testing maximum asset attachment constraints under multiple sequential/concurrent uploads.",
            "category": "Infrastructure",
            "affected_population": 250,
            "location": {"lat": 23.49, "lng": 85.45},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]

    # Upload 5 valid assets
    for i in range(5):
        fake_img = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00" + f"Asset{i}".encode())
        res = await client.post(
            f"/api/v1/challenges/{challenge_id}/assets",
            headers=citizen_auth["headers"],
            files={"file": (f"evidence_{i}.jpg", fake_img, "image/jpeg")},
            data={"media_type": "image"}
        )
        assert res.status_code == 201

    # 6th asset must be rejected
    fake_img_6 = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00" + b"Asset6")
    res_6 = await client.post(
        f"/api/v1/challenges/{challenge_id}/assets",
        headers=citizen_auth["headers"],
        files={"file": ("evidence_6.jpg", fake_img_6, "image/jpeg")},
        data={"media_type": "image"}
    )
    assert res_6.status_code == 400
    assert res_6.json()["error"]["code"] == "MAX_ASSETS_EXCEEDED"
