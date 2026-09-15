import uuid
import pytest
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.asyncio
class TestTeamsAPI:
    """REST API endpoints & standardized JSON response envelopes testing."""

    async def test_api_crud_and_envelopes(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """Verify standard success envelopes across CRUD endpoints."""
        # 1. POST /api/v1/teams
        create_res = await client.post(
            "/api/v1/teams",
            json={
                "name": "API Envelopes Test Squad",
                "description": "Validating standardized JSON response structures across all routes.",
                "challenge_id": sample_challenge["id"],
                "max_members": 4,
                "skills_needed": ["FastAPI", "PostgreSQL"]
            },
            headers=leader_auth["headers"]
        )
        assert create_res.status_code == 201
        res_json = create_res.json()
        assert res_json["success"] is True
        assert "data" in res_json
        team_id = res_json["data"]["id"]

        # 2. GET /api/v1/teams
        list_res = await client.get("/api/v1/teams?page=1&page_size=10", headers=leader_auth["headers"])
        assert list_res.status_code == 200
        l_json = list_res.json()
        assert l_json["success"] is True
        assert "items" in l_json["data"]
        assert "total" in l_json["data"]

        # 3. GET /api/v1/teams/my-teams
        my_res = await client.get("/api/v1/teams/my-teams", headers=leader_auth["headers"])
        assert my_res.status_code == 200
        assert my_res.json()["success"] is True
        assert isinstance(my_res.json()["data"], list)

        # 4. GET /api/v1/teams/{id}
        get_res = await client.get(f"/api/v1/teams/{team_id}", headers=leader_auth["headers"])
        assert get_res.status_code == 200
        assert get_res.json()["success"] is True
        assert get_res.json()["data"]["id"] == team_id
        assert "members" in get_res.json()["data"]

        # 5. PATCH /api/v1/teams/{id}
        patch_res = await client.patch(
            f"/api/v1/teams/{team_id}",
            json={"name": "API Envelopes Updated Name"},
            headers=leader_auth["headers"]
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["success"] is True
        assert patch_res.json()["data"]["name"] == "API Envelopes Updated Name"

        # 6. POST /api/v1/teams/{id}/invitations
        inv_res = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        assert inv_res.status_code == 201
        assert inv_res.json()["success"] is True
        inv_id = inv_res.json()["data"]["id"]

        # 7. GET /api/v1/teams/invitations/me
        my_inv_res = await client.get("/api/v1/teams/invitations/me", headers=collaborator1_auth["headers"])
        assert my_inv_res.status_code == 200
        assert my_inv_res.json()["success"] is True

        # 8. POST /api/v1/teams/invitations/{member_id}/action
        acc_res = await client.post(
            f"/api/v1/teams/invitations/{inv_id}/action",
            json={"action": "accept"},
            headers=collaborator1_auth["headers"]
        )
        assert acc_res.status_code == 200
        assert acc_res.json()["success"] is True

        # 9. POST /api/v1/teams/{id}/transfer-leadership
        transfer_res = await client.post(
            f"/api/v1/teams/{team_id}/transfer-leadership",
            json={"new_leader_id": collaborator1_auth["user_id"]},
            headers=leader_auth["headers"]
        )
        assert transfer_res.status_code == 200
        assert transfer_res.json()["success"] is True

        # 10. DELETE /api/v1/teams/{id}
        disband_res = await client.delete(f"/api/v1/teams/{team_id}", headers=collaborator1_auth["headers"])
        assert disband_res.status_code == 200
        assert disband_res.json()["success"] is True
        assert disband_res.json()["data"]["status"] == "DISBANDED"

    async def test_error_envelopes(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any]
    ):
        """Verify standardized error envelope on 404 Not Found."""
        fake_id = uuid.uuid4()
        res = await client.get(f"/api/v1/teams/{fake_id}", headers=leader_auth["headers"])
        assert res.status_code == 404
        data = res.json()
        assert data["success"] is False
        assert "error" in data
        assert data["error"]["code"] == "NOT_FOUND"
