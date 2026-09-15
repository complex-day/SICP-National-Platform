import uuid
import pytest
from httpx import AsyncClient
from typing import Dict, Any

from app.core.constants import TeamStatus, TeamVisibility, TeamMemberRole, TeamMemberStatus


@pytest.mark.asyncio
class TestTeamStateMachine:
    """Tests for Team lifecycle state transitions and Disbanded state protection."""

    async def _create_team(self, client: AsyncClient, leader_auth: Dict[str, Any], challenge_id: str, max_members: int = 3) -> str:
        payload = {
            "name": f"SM Test Team {uuid.uuid4().hex[:6]}",
            "description": "A team created for state machine testing lifecycle transitions.",
            "challenge_id": challenge_id,
            "max_members": max_members,
            "visibility": "PUBLIC",
            "skills_needed": ["Python", "IoT"]
        }
        res = await client.post("/api/v1/teams", json=payload, headers=leader_auth["headers"])
        assert res.status_code == 201, f"Create team failed: {res.text}"
        return res.json()["data"]["id"]

    async def test_team_creation_initial_state_open(
        self, client: AsyncClient, leader_auth: Dict[str, Any], sample_challenge: Dict[str, Any]
    ):
        """TEST-TEAM-SM-001: Creator creates team with valid challenge -> initial state OPEN."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"])
        get_res = await client.get(f"/api/v1/teams/{team_id}", headers=leader_auth["headers"])
        assert get_res.status_code == 200
        data = get_res.json()["data"]
        assert data["status"] == "OPEN"
        assert data["active_contributors_count"] == 1  # Leader

    async def test_team_transitions_to_full_and_back_to_open(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-TEAM-SM-002 & 003: Contributor reaches max_members -> FULL; member leaves -> OPEN."""
        # Team with max_members = 2 (Leader + 1 Collaborator)
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"], max_members=2)

        # Collaborator 1 requests to join
        req_res = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "I'd like to contribute."},
            headers=collaborator1_auth["headers"]
        )
        assert req_res.status_code == 201
        member_id = req_res.json()["data"]["id"]

        # Leader accepts -> team reaches max_members (2) -> status becomes FULL
        acc_res = await client.post(
            f"/api/v1/teams/{team_id}/join-requests/{member_id}/action",
            json={"action": "accept"},
            headers=leader_auth["headers"]
        )
        assert acc_res.status_code == 200

        team_res = await client.get(f"/api/v1/teams/{team_id}", headers=leader_auth["headers"])
        assert team_res.json()["data"]["status"] == "FULL"
        assert team_res.json()["data"]["active_contributors_count"] == 2

        # Collaborator leaves -> capacity frees up -> status auto-reverts to OPEN
        leave_res = await client.post(f"/api/v1/teams/{team_id}/leave", headers=collaborator1_auth["headers"])
        assert leave_res.status_code == 200

        team_res2 = await client.get(f"/api/v1/teams/{team_id}", headers=leader_auth["headers"])
        assert team_res2.json()["data"]["status"] == "OPEN"
        assert team_res2.json()["data"]["active_contributors_count"] == 1

    async def test_team_lock_and_unlock(
        self, client: AsyncClient, leader_auth: Dict[str, Any], sample_challenge: Dict[str, Any]
    ):
        """TEST-TEAM-SM-004 & 005: Leader toggles lock/unlock."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"])

        # Lock
        lock_res = await client.patch(
            f"/api/v1/teams/{team_id}/status",
            json={"status": "LOCKED"},
            headers=leader_auth["headers"]
        )
        assert lock_res.status_code == 200
        assert lock_res.json()["data"]["status"] == "LOCKED"

        # Unlock
        unlock_res = await client.patch(
            f"/api/v1/teams/{team_id}/status",
            json={"status": "OPEN"},
            headers=leader_auth["headers"]
        )
        assert unlock_res.status_code == 200
        assert unlock_res.json()["data"]["status"] == "OPEN"

    async def test_disbanded_team_protection_rules(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        collaborator2_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-TEAM-SM-006 to 012: Disbanding a team permanently locks all subsequent actions with 400 INVALID_TEAM_STATE."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"])

        # Disband team
        disband_res = await client.delete(f"/api/v1/teams/{team_id}", headers=leader_auth["headers"])
        assert disband_res.status_code == 200
        assert disband_res.json()["data"]["status"] == "DISBANDED"

        # 1. Edit metadata should fail (400)
        edit_res = await client.patch(
            f"/api/v1/teams/{team_id}",
            json={"name": "Attempting to change name"},
            headers=leader_auth["headers"]
        )
        assert edit_res.status_code == 400
        assert edit_res.json()["error"]["code"] == "INVALID_TEAM_STATE"

        # 2. Status change should fail (400)
        status_res = await client.patch(
            f"/api/v1/teams/{team_id}/status",
            json={"status": "OPEN"},
            headers=leader_auth["headers"]
        )
        assert status_res.status_code == 400
        assert status_res.json()["error"]["code"] == "INVALID_TEAM_STATE"

        # 3. Send invitation should fail (400)
        invite_res = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        assert invite_res.status_code == 400
        assert invite_res.json()["error"]["code"] == "INVALID_TEAM_STATE"

        # 4. Submit join request should fail (400)
        join_res = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Please let me in."},
            headers=collaborator2_auth["headers"]
        )
        assert join_res.status_code == 400
        assert join_res.json()["error"]["code"] == "INVALID_TEAM_STATE"

    async def test_join_request_on_locked_team(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-TEAM-SM-013: Attempting join request on LOCKED team returns 400."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"])
        await client.patch(
            f"/api/v1/teams/{team_id}/status",
            json={"status": "LOCKED"},
            headers=leader_auth["headers"]
        )

        join_res = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Applying to locked team."},
            headers=collaborator1_auth["headers"]
        )
        assert join_res.status_code == 400
        assert join_res.json()["error"]["code"] == "INVALID_TEAM_STATE"
