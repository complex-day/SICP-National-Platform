import uuid
import pytest
from httpx import AsyncClient
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.audit_log import AuditLog
from app.core.constants import AuditAction


@pytest.mark.asyncio
class TestTeamAuditLogging:
    """Audit trail verification across all 17 mandatory Module 3 actions."""

    async def _get_audit_events_for_entity(self, db_session: AsyncSession, entity_id: uuid.UUID):
        stmt = select(AuditLog).where(AuditLog.entity_id == entity_id).order_by(AuditLog.created_at.asc())
        result = await db_session.execute(stmt)
        return list(result.scalars().all())

    async def test_all_17_audit_actions_emitted(
        self,
        client: AsyncClient,
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        collaborator2_auth: Dict[str, Any],
        mentor1_auth: Dict[str, Any],
        sample_challenge: Dict[str, Any],
        db_session: AsyncSession
    ):
        """End-to-end trigger of all 17 lifecycle operations and audit log verification."""
        # 1. TEAM_CREATED
        res = await client.post(
            "/api/v1/teams",
            json={
                "name": "Full Audit Verification Squad",
                "description": "Triggering all seventeen audit events across lifecycle transitions.",
                "challenge_id": sample_challenge["id"],
                "max_members": 4,
                "skills_needed": ["Auditing", "Python"]
            },
            headers=leader_auth["headers"]
        )
        assert res.status_code == 201
        team_id = uuid.UUID(res.json()["data"]["id"])

        # 2. TEAM_UPDATED
        await client.patch(
            f"/api/v1/teams/{team_id}",
            json={"description": "Updated description with more than twenty characters."},
            headers=leader_auth["headers"]
        )

        # 3. TEAM_LOCKED
        await client.patch(f"/api/v1/teams/{team_id}/status", json={"status": "LOCKED"}, headers=leader_auth["headers"])

        # 4. TEAM_UNLOCKED
        await client.patch(f"/api/v1/teams/{team_id}/status", json={"status": "OPEN"}, headers=leader_auth["headers"])

        # 5. INVITATION_SENT
        inv1 = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator1_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        inv1_id = inv1.json()["data"]["id"]

        # 6. INVITATION_ACCEPTED
        await client.post(f"/api/v1/teams/invitations/{inv1_id}/action", json={"action": "accept"}, headers=collaborator1_auth["headers"])

        # 7. INVITATION_SENT & DECLINED
        inv2 = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": mentor1_auth["user_id"], "role": "MENTOR"},
            headers=leader_auth["headers"]
        )
        inv2_id = inv2.json()["data"]["id"]
        # 8. INVITATION_DECLINED
        await client.post(f"/api/v1/teams/invitations/{inv2_id}/action", json={"action": "decline"}, headers=mentor1_auth["headers"])

        # 9. JOIN_REQUEST_SENT & WITHDRAWN
        r1 = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Temporary request."},
            headers=collaborator2_auth["headers"]
        )
        r1_id = r1.json()["data"]["id"]
        # 10. JOIN_REQUEST_WITHDRAWN
        await client.post(f"/api/v1/teams/join-requests/{r1_id}/withdraw", headers=collaborator2_auth["headers"])

        # 11. JOIN_REQUEST_SENT & ACCEPTED
        r2 = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Re-applying."},
            headers=collaborator2_auth["headers"]
        )
        r2_id = r2.json()["data"]["id"]
        # 12. JOIN_REQUEST_ACCEPTED
        await client.post(f"/api/v1/teams/{team_id}/join-requests/{r2_id}/action", json={"action": "accept"}, headers=leader_auth["headers"])

        # 13. MEMBER_ROLE_CHANGED (Promote Collaborator 1 to CO_LEADER)
        await client.patch(
            f"/api/v1/teams/{team_id}/members/{collaborator1_auth['user_id']}/role",
            json={"role": "CO_LEADER"},
            headers=leader_auth["headers"]
        )

        # 14. LEADERSHIP_TRANSFERRED (Transfer to Collaborator 1)
        await client.post(
            f"/api/v1/teams/{team_id}/transfer-leadership",
            json={"new_leader_id": collaborator1_auth["user_id"]},
            headers=leader_auth["headers"]
        )

        # 15. MEMBER_REMOVED (New leader removes Collaborator 2)
        await client.delete(
            f"/api/v1/teams/{team_id}/members/{collaborator2_auth['user_id']}",
            headers=collaborator1_auth["headers"]
        )

        # 16. MEMBER_LEFT (Old leader leaves team)
        await client.post(f"/api/v1/teams/{team_id}/leave", headers=leader_auth["headers"])

        # 17. TEAM_DISBANDED
        await client.delete(f"/api/v1/teams/{team_id}", headers=collaborator1_auth["headers"])

        # Verify audit logs in database
        logs = await self._get_audit_events_for_entity(db_session, team_id)
        actions = [log.action for log in logs]

        expected_actions = [
            AuditAction.TEAM_CREATED.value,
            AuditAction.TEAM_UPDATED.value,
            AuditAction.TEAM_LOCKED.value,
            AuditAction.TEAM_UNLOCKED.value,
            AuditAction.INVITATION_SENT.value,
            AuditAction.INVITATION_ACCEPTED.value,
            AuditAction.INVITATION_DECLINED.value,
            AuditAction.JOIN_REQUEST_SENT.value,
            AuditAction.JOIN_REQUEST_WITHDRAWN.value,
            AuditAction.JOIN_REQUEST_ACCEPTED.value,
            AuditAction.MEMBER_ROLE_CHANGED.value,
            AuditAction.LEADERSHIP_TRANSFERRED.value,
            AuditAction.MEMBER_REMOVED.value,
            AuditAction.MEMBER_LEFT.value,
            AuditAction.TEAM_DISBANDED.value,
        ]

        for exp in expected_actions:
            assert exp in actions, f"Audit action {exp} not found in emitted logs: {actions}"
