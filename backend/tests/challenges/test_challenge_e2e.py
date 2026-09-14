import pytest
import io
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.asyncio
async def test_chal_e2e_001_full_lifecycle(
    client: AsyncClient,
    citizen_auth: Dict[str, Any],
    evaluator_auth: Dict[str, Any],
    admin_auth: Dict[str, Any]
):
    """CHAL-E2E-001: Full Citizen Challenge Lifecycle Journey.
    Draft -> Upload Asset -> Submit -> Review -> Approve -> Publish -> Close -> Archive.
    """
    # 1. Citizen creates draft challenge
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Complete E2E Water Purification Challenge",
            "description": "Entire village suffers from high fluoride concentration causing fluorosis among children.",
            "category": "Water",
            "subcategory": "Chemical Contamination",
            "affected_population": 1800,
            "location": {
                "lat": 23.60,
                "lng": 85.54,
                "address_text": "Block C, Village Rampur",
                "district": "Ranchi",
                "state": "Jharkhand"
            },
            "status": "draft",
            "visibility": "PUBLIC"
        }
    )
    assert create_res.status_code == 201
    challenge_id = create_res.json()["data"]["id"]
    v1 = create_res.json()["data"]["version"]

    # 2. Citizen attaches photographic evidence
    fake_jpeg = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00" + b"E2EEvidencePhoto")
    asset_res = await client.post(
        f"/api/v1/challenges/{challenge_id}/assets",
        headers=citizen_auth["headers"],
        files={"file": ("water_test_photo.jpg", fake_jpeg, "image/jpeg")},
        data={"media_type": "image"}
    )
    assert asset_res.status_code == 201

    # 3. Citizen submits challenge
    submit_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=citizen_auth["headers"],
        json={"status": "submitted", "version": v1, "reason": "Uploaded photo evidence and verified all fields"}
    )
    assert submit_res.status_code == 200
    v2 = submit_res.json()["data"]["version"]

    # 4. Evaluator starts review
    review_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=evaluator_auth["headers"],
        json={"status": "under_review", "version": v2, "reason": "Academic panel evaluating feasibility"}
    )
    assert review_res.status_code == 200
    v3 = review_res.json()["data"]["version"]

    # 5. Evaluator approves challenge
    approve_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=evaluator_auth["headers"],
        json={"status": "approved", "version": v3, "reason": "Passed technical evaluation criteria"}
    )
    assert approve_res.status_code == 200
    v4 = approve_res.json()["data"]["version"]

    # 6. Admin publishes challenge
    publish_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=admin_auth["headers"],
        json={"status": "published", "version": v4}
    )
    assert publish_res.status_code == 200
    assert publish_res.json()["data"]["published_at"] is not None
    v5 = publish_res.json()["data"]["version"]

    # 7. Check public discovery in /challenges
    catalog_res = await client.get("/api/v1/challenges?status=published&category=Water", headers=citizen_auth["headers"])
    assert catalog_res.status_code == 200
    matching = [c for c in catalog_res.json()["data"]["items"] if c["id"] == challenge_id]
    assert len(matching) == 1

    # 8. Admin closes challenge
    close_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=admin_auth["headers"],
        json={"status": "closed", "version": v5, "reason": "Solution prototype project initiated in M5"}
    )
    assert close_res.status_code == 200
    v6 = close_res.json()["data"]["version"]

    # 9. Admin archives challenge
    archive_res = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=admin_auth["headers"],
        json={"status": "archived", "version": v6}
    )
    assert archive_res.status_code == 200
    assert archive_res.json()["data"]["archived_at"] is not None
