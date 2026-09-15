import uuid
import pytest
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.asyncio
class TestTeamAuthMatrix:
    """Role-action authorization matrix and RBAC boundary verification."""

    async def test_team_creation_role_restrictions(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        citizen_auth: Dict[str, Any],
        mentor1_auth: Dict[str, Any],
        admin_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-AUTH-MAT-001, 002, 003: Only student or admin can create teams; citizen/faculty forbidden."""
        payload = {
            "name": "Auth Matrix Team",
            "description": "Testing role restrictions during team creation endpoint calls.",
            "challenge_id": sample_challenge["id"],
            "max_members": 5
        }

        # 1. Student -> 201 Created
        student_res = await client.post("/api/v1/teams", json=payload, headers=leader_auth["headers"])
        assert student_res.status_code == 201

        # 2. Citizen -> 403 Forbidden
        citizen_res = await client.post(
            "/api/v1/teams",
            json={**payload, "name": "Citizen Team Attempt"},
            headers=citizen_auth["headers"]
        )
        assert citizen_res.status_code == 403

        # 3. Faculty -> 403 Forbidden (Faculty are mentors, not student founders)
        faculty_res = await client.post(
            "/api/v1/teams",
            json={**payload, "name": "Faculty Team Attempt"},
            headers=mentor1_auth["headers"]
        )
        assert faculty_res.status_code == 403

    async def test_team_admin_and_member_permissions(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        collaborator2_auth: Dict[str, Any],
        admin_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-AUTH-MAT-004 to 013: Granular Leader vs Co-Leader vs Member permissions."""
        # 1. Create team by Leader
        team_res = await client.post(
            "/api/v1/teams",
            json={
                "name": f"Roles Verification Squad {uuid.uuid4().hex[:6]}",
                "description": "Testing permissions between Leader, Co-Leader, and Member.",
                "challenge_id": sample_challenge["id"],
                "max_members": 5
            },
            headers=leader_auth["headers"]
        )
        team_id = team_res.json()["data"]["id"]

        # 2. Add Collaborator 1 and Collaborator 2
        inv1 = await client.post(f"/api/v1/teams/{team_id}/invitations", json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER"}, headers=leader_auth["headers"])
        await client.post(f"/api/v1/teams/invitations/{inv1.json()['data']['id']}/action", json={"action": "accept"}, headers=collaborator1_auth["headers"])

        inv2 = await client.post(f"/api/v1/teams/{team_id}/invitations", json={"user_id": collaborator2_auth["user_id"], "role": "MEMBER"}, headers=leader_auth["headers"])
        await client.post(f"/api/v1/teams/invitations/{inv2.json()['data']['id']}/action", json={"action": "accept"}, headers=collaborator2_auth["headers"])

        # 3. Member (Collaborator 1) tries to update team settings -> 403 Forbidden
        bad_edit = await client.patch(
            f"/api/v1/teams/{team_id}",
            json={"description": "Unauthorized description modification."},
            headers=collaborator1_auth["headers"]
        )
        assert bad_edit.status_code == 403

        # 4. Leader promotes Collaborator 1 to CO_LEADER
        promote_res = await client.patch(
            f"/api/v1/teams/{team_id}/members/{collaborator1_auth['user_id']}/role",
            json={"role": "CO_LEADER"},
            headers=leader_auth["headers"]
        )
        assert promote_res.status_code == 200

        # 5. Co-Leader (Collaborator 1) can now update team settings -> 200 OK
        good_edit = await client.patch(
            f"/api/v1/teams/{team_id}",
            json={"description": "Authorized Co-Leader description modification."},
            headers=collaborator1_auth["headers"]
        )
        assert good_edit.status_code == 200

        # 6. Co-Leader cannot promote members -> 403 Forbidden
        bad_promote = await client.patch(
            f"/api/v1/teams/{team_id}/members/{collaborator2_auth['user_id']}/role",
            json={"role": "CO_LEADER"},
            headers=collaborator1_auth["headers"]
        )
        assert bad_promote.status_code == 403

        # 7. Admin bypass can disband any team -> 200 OK
        admin_disband = await client.delete(f"/api/v1/teams/{team_id}", headers=admin_auth["headers"])
        assert admin_disband.status_code == 200

    async def test_mentor_invitation_platform_role_check(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        mentor1_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any]
    ):
        """TEST-AUTH-MAT-014 & 015: Only users with faculty or industry platform role can be invited as MENTOR."""
        team_res = await client.post(
            "/api/v1/teams",
            json={
                "name": f"Mentor Role Check Squad {uuid.uuid4().hex[:6]}",
                "description": "Verifying role suitability constraints for prospective mentors.",
                "challenge_id": sample_challenge["id"],
                "max_members": 4
            },
            headers=leader_auth["headers"]
        )
        team_id = team_res.json()["data"]["id"]

        # 1. Invite Faculty as MENTOR -> 201 Created
        fac_inv = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": mentor1_auth["user_id"], "role": "MENTOR"},
            headers=leader_auth["headers"]
        )
        assert fac_inv.status_code == 201

        # 2. Attempt to invite Student as MENTOR -> 400 Validation Error
        stu_inv = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MENTOR"},
            headers=leader_auth["headers"]
        )
        assert stu_inv.status_code == 400
