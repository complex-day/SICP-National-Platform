import uuid
import asyncio
import pytest
from httpx import AsyncClient
from typing import Dict, Any

from app.core.constants import TeamStatus, TeamMemberRole, TeamMemberStatus


@pytest.mark.asyncio
class TestTeamCapacityConcurrency:
    """Tests for Contributor vs Mentor capacity limits, single ownership (FR-M3-15), single participation (FR-M3-14), and race conditions."""

    async def _create_team(self, client: AsyncClient, leader_auth: Dict[str, Any], challenge_id: str, max_members: int = 5) -> str:
        payload = {
            "name": f"Concurrency Squad {uuid.uuid4().hex[:6]}",
            "description": "Testing atomic capacity limits and concurrent mutation safety.",
            "challenge_id": challenge_id,
            "max_members": max_members,
            "visibility": "PUBLIC"
        }
        res = await client.post("/api/v1/teams", json=payload, headers=leader_auth["headers"])
        assert res.status_code == 201
        return res.json()["data"]["id"]

    async def test_mentor_capacity_limit_max_2_mentors(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        mentor1_auth: Dict[str, Any],
        mentor2_auth: Dict[str, Any],
        mentor3_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-CONC-003 & 005: Teams allow at most 2 active mentors; mentors do not consume contributor capacity."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"], max_members=2)

        # 1. Invite and activate Mentor 1
        inv1 = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": mentor1_auth["user_id"], "role": "MENTOR"},
            headers=leader_auth["headers"]
        )
        assert inv1.status_code == 201
        await client.post(f"/api/v1/teams/invitations/{inv1.json()['data']['id']}/action", json={"action": "accept"}, headers=mentor1_auth["headers"])

        # 2. Invite and activate Mentor 2
        inv2 = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": mentor2_auth["user_id"], "role": "MENTOR"},
            headers=leader_auth["headers"]
        )
        assert inv2.status_code == 201
        await client.post(f"/api/v1/teams/invitations/{inv2.json()['data']['id']}/action", json={"action": "accept"}, headers=mentor2_auth["headers"])

        # Team should have 1 active contributor (Leader) and 2 active mentors
        t_res = await client.get(f"/api/v1/teams/{team_id}", headers=leader_auth["headers"])
        assert t_res.json()["data"]["active_contributors_count"] == 1
        assert t_res.json()["data"]["active_mentors_count"] == 2
        assert t_res.json()["data"]["status"] == "OPEN"  # Contributor slot still open!

        # 3. Attempting to invite 3rd mentor -> 409 Conflict (MENTOR_CAPACITY_EXCEEDED)
        inv3 = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": mentor3_auth["user_id"], "role": "MENTOR"},
            headers=leader_auth["headers"]
        )
        assert inv3.status_code == 409
        assert inv3.json()["error"]["code"] == "MENTOR_CAPACITY_EXCEEDED"

    async def test_single_team_ownership_per_challenge(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-CONC-006 & 007: A user cannot own more than 1 active team per challenge (FR-M3-15)."""
        # Team 1 created successfully
        team1_id = await self._create_team(client, leader_auth, sample_challenge["id"])

        # Attempting to create Team 2 on the same challenge -> 409 Conflict
        res2 = await client.post(
            "/api/v1/teams",
            json={
                "name": "Second Team Attempt",
                "description": "Attempting to own a second active team on this challenge.",
                "challenge_id": sample_challenge["id"],
                "max_members": 4
            },
            headers=leader_auth["headers"]
        )
        assert res2.status_code == 409
        assert res2.json()["error"]["code"] == "DUPLICATE_ACTIVE_TEAM_OWNERSHIP"

        # Disband Team 1
        await client.delete(f"/api/v1/teams/{team1_id}", headers=leader_auth["headers"])

        # After Team 1 is DISBANDED, creating a new team on the challenge is now allowed!
        res3 = await client.post(
            "/api/v1/teams",
            json={
                "name": "Replacement Team Squad",
                "description": "Created after previous team was cleanly disbanded.",
                "challenge_id": sample_challenge["id"],
                "max_members": 4
            },
            headers=leader_auth["headers"]
        )
        assert res3.status_code == 201

    async def test_single_active_participation_per_challenge(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        collaborator2_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-CONC-008: Student active in Team A cannot join Team B on the same challenge (FR-M3-14)."""
        # Leader creates Team A
        team_a_id = await self._create_team(client, leader_auth, sample_challenge["id"])

        # Collaborator 2 creates Team B on the same challenge
        team_b_id = await self._create_team(client, collaborator2_auth, sample_challenge["id"])

        # Collaborator 1 joins Team A
        inv_a = await client.post(
            f"/api/v1/teams/{team_a_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        await client.post(f"/api/v1/teams/invitations/{inv_a.json()['data']['id']}/action", json={"action": "accept"}, headers=collaborator1_auth["headers"])

        # Collaborator 1 now attempts to submit join request to Team B on same challenge -> 409 Conflict
        dup_join = await client.post(
            f"/api/v1/teams/{team_b_id}/join-requests",
            json={"message": "Applying to Team B too."},
            headers=collaborator1_auth["headers"]
        )
        assert dup_join.status_code == 409
        assert dup_join.json()["error"]["code"] == "DUPLICATE_TEAM_MEMBERSHIP"

    async def test_contributor_capacity_overflow_rejection(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        collaborator2_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-CONC-001 & 002: Rejection of applicant when capacity is full (max_members = 2)."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"], max_members=2)

        # 1. Fill the 1 open slot with Collaborator 1
        inv1 = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        await client.post(f"/api/v1/teams/invitations/{inv1.json()['data']['id']}/action", json={"action": "accept"}, headers=collaborator1_auth["headers"])

        # 2. Team is now FULL. Collaborator 2 attempts to join -> 400 Bad Request / 409 Conflict
        full_join = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Want to join full team."},
            headers=collaborator2_auth["headers"]
        )
        assert full_join.status_code in (400, 409)
