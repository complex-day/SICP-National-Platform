import uuid
import pytest
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient
from typing import Dict, Any

from app.core.constants import TeamStatus, TeamMemberRole, TeamMemberStatus
from app.models.team import TeamMember
from app.repositories.team_repository import TeamMemberRepository


@pytest.mark.asyncio
class TestTeamMembershipLifecycle:
    """Tests for membership states, 14-day invitation expiry, join request withdrawal, and cross-channel integrity."""

    async def _create_team(self, client: AsyncClient, leader_auth: Dict[str, Any], challenge_id: str, max_members: int = 5) -> str:
        payload = {
            "name": f"Lifecycle Squad {uuid.uuid4().hex[:6]}",
            "description": "Testing full membership lifecycle state transitions.",
            "challenge_id": challenge_id,
            "max_members": max_members,
            "visibility": "PUBLIC"
        }
        res = await client.post("/api/v1/teams", json=payload, headers=leader_auth["headers"])
        assert res.status_code == 201
        return res.json()["data"]["id"]

    async def test_join_request_and_applicant_withdrawal(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        collaborator2_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-MEM-LC-001 to 004: Join request creation, applicant withdrawal, and forbidden non-applicant withdrawal."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"])

        # 1. Collaborator 1 submits join request
        req_res = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Passionate about water quality."},
            headers=collaborator1_auth["headers"]
        )
        assert req_res.status_code == 201
        req_id = req_res.json()["data"]["id"]
        assert req_res.json()["data"]["status"] == "REQUESTED"

        # 2. Collaborator 2 attempts to withdraw Collaborator 1's request -> 403 Forbidden
        bad_withdraw = await client.post(
            f"/api/v1/teams/join-requests/{req_id}/withdraw",
            headers=collaborator2_auth["headers"]
        )
        assert bad_withdraw.status_code == 403

        # 3. Collaborator 1 withdraws their own request -> 200 OK, status WITHDRAWN
        good_withdraw = await client.post(
            f"/api/v1/teams/join-requests/{req_id}/withdraw",
            headers=collaborator1_auth["headers"]
        )
        assert good_withdraw.status_code == 200
        assert good_withdraw.json()["data"]["status"] == "WITHDRAWN"

        # 4. Attempting to withdraw already WITHDRAWN request -> 409 Conflict
        repeat_withdraw = await client.post(
            f"/api/v1/teams/join-requests/{req_id}/withdraw",
            headers=collaborator1_auth["headers"]
        )
        assert repeat_withdraw.status_code == 409

    async def test_join_request_accept_and_reject(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        collaborator2_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-MEM-LC-005 & 006: Leader accepts and rejects join requests."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"])

        # Request 1 (Accept)
        r1 = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Accept me."},
            headers=collaborator1_auth["headers"]
        )
        r1_id = r1.json()["data"]["id"]

        acc_res = await client.post(
            f"/api/v1/teams/{team_id}/join-requests/{r1_id}/action",
            json={"action": "accept"},
            headers=leader_auth["headers"]
        )
        assert acc_res.status_code == 200
        assert acc_res.json()["data"]["status"] == "ACTIVE"

        # Request 2 (Reject)
        r2 = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Reject me."},
            headers=collaborator2_auth["headers"]
        )
        r2_id = r2.json()["data"]["id"]

        rej_res = await client.post(
            f"/api/v1/teams/{team_id}/join-requests/{r2_id}/action",
            json={"action": "reject"},
            headers=leader_auth["headers"]
        )
        assert rej_res.status_code == 200
        assert rej_res.json()["data"]["status"] == "REJECTED"

    async def test_invitation_lifecycle_and_expiration(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        collaborator2_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any],
        db_session
    ):
        """TEST-MEM-LC-007 to 010: Sending invitations (14d expiry), acceptance, and expired invitation rejection."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"])

        # 1. Send invite to Collaborator 1
        inv_res = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER", "message": "Join us!"},
            headers=leader_auth["headers"]
        )
        assert inv_res.status_code == 201
        inv_data = inv_res.json()["data"]
        assert inv_data["status"] == "INVITED"
        assert inv_data["expires_at"] is not None

        # Collaborator 1 accepts unexpired invite
        acc_res = await client.post(
            f"/api/v1/teams/invitations/{inv_data['id']}/action",
            json={"action": "accept"},
            headers=collaborator1_auth["headers"]
        )
        assert acc_res.status_code == 200
        assert acc_res.json()["data"]["status"] == "ACTIVE"

        # 2. Send invite to Collaborator 2, but backdate expires_at to simulate expiration (>14 days ago)
        inv2_res = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator2_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        assert inv2_res.status_code == 201
        inv2_id = inv2_res.json()["data"]["id"]

        # Backdate expiration in database
        repo = TeamMemberRepository(db_session)
        member = await repo.get_member_by_id(uuid.UUID(inv2_id))
        member.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
        await db_session.commit()

        # Collaborator 2 attempts to accept expired invite -> 409 Conflict
        expired_acc = await client.post(
            f"/api/v1/teams/invitations/{inv2_id}/action",
            json={"action": "accept"},
            headers=collaborator2_auth["headers"]
        )
        assert expired_acc.status_code == 409
        assert expired_acc.json()["error"]["code"] == "INVITATION_EXPIRED"

    async def test_cross_channel_membership_integrity_rules(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-MEM-LC-011 to 015: Duplicate active/invite/request rejections return 409 Conflict."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"])

        # 1. Invite Collaborator 1
        inv_res = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        assert inv_res.status_code == 201

        # 2. Invite same user again while invitation pending -> 409 Conflict
        dup_inv = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        assert dup_inv.status_code == 409

        # 3. User with pending invite attempts to submit join request -> 409 Conflict
        join_while_invited = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Trying to apply while invited."},
            headers=collaborator1_auth["headers"]
        )
        assert join_while_invited.status_code == 409

        # 4. Accept invite -> user is now ACTIVE
        inv_id = inv_res.json()["data"]["id"]
        await client.post(
            f"/api/v1/teams/invitations/{inv_id}/action",
            json={"action": "accept"},
            headers=collaborator1_auth["headers"]
        )

        # 5. Invite already ACTIVE member -> 409 Conflict
        invite_active = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        assert invite_active.status_code == 409

    async def test_member_removal_and_sole_leader_exit_prevention(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-MEM-LC-016 to 018: Voluntary exit, leader removal, and sole leader exit prevention."""
        team_id = await self._create_team(client, leader_auth, sample_challenge["id"])

        # Sole leader cannot leave without transferring leadership (400)
        sole_leave = await client.post(f"/api/v1/teams/{team_id}/leave", headers=leader_auth["headers"])
        assert sole_leave.status_code == 400

        # Add member
        inv_res = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        inv_id = inv_res.json()["data"]["id"]
        await client.post(f"/api/v1/teams/invitations/{inv_id}/action", json={"action": "accept"}, headers=collaborator1_auth["headers"])

        # Leader removes member
        rem_res = await client.delete(
            f"/api/v1/teams/{team_id}/members/{collaborator1_auth['user_id']}",
            headers=leader_auth["headers"]
        )
        assert rem_res.status_code == 200
        assert rem_res.json()["data"]["status"] == "REMOVED"
