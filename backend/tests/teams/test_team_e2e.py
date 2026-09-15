import uuid
import pytest
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.asyncio
class TestTeamE2ELifecycle:
    """Full end-to-end collaborative team lifecycle integration test."""

    async def test_full_collaborative_team_lifecycle(
        self,
        client: AsyncClient,
        citizen_auth: Dict[str, Any],
        leader_auth: Dict[str, Any],
        collaborator1_auth: Dict[str, Any],
        collaborator2_auth: Dict[str, Any],
        collaborator3_auth: Dict[str, Any],
        mentor1_auth: Dict[str, Any],
        mentor2_auth: Dict[str, Any],
        mentor3_auth: Dict[str, Any],
        admin_auth: Dict[str, Any]
    ):
        # Step 1: Citizen creates a verified societal challenge
        challenge_payload = {
            "title": "Solar Desalination for Coastal Saline Wells",
            "description": "High salinity in drinking wells across coastal villages requiring distributed solar stills.",
            "category": "Water",
            "subcategory": "Desalination",
            "affected_population": 12000,
            "location": {
                "lat": 21.7051,
                "lng": 72.9959,
                "address_text": "Coastal Saline Wells Block 2",
                "district": "Bharuch",
                "state": "Gujarat"
            }
        }
        ch_res = await client.post("/api/v1/challenges", json=challenge_payload, headers=citizen_auth["headers"])
        assert ch_res.status_code == 201
        challenge_id = ch_res.json()["data"]["id"]

        # Citizen submits, Admin publishes challenge
        await client.patch(f"/api/v1/challenges/{challenge_id}/status", json={"status": "submitted", "version": 1}, headers=citizen_auth["headers"])
        await client.patch(f"/api/v1/challenges/{challenge_id}/status", json={"status": "under_review", "version": 2}, headers=admin_auth["headers"])
        await client.patch(f"/api/v1/challenges/{challenge_id}/status", json={"status": "approved", "version": 3}, headers=admin_auth["headers"])
        await client.patch(f"/api/v1/challenges/{challenge_id}/status", json={"status": "published", "version": 4}, headers=admin_auth["headers"])

        # Step 2: Student A (Leader) creates team anchored to this challenge (max_members = 3)
        team_payload = {
            "name": "Solar Desalination Innovators",
            "description": "Engineering thermal solar concentrators for rural brine distillation.",
            "challenge_id": challenge_id,
            "max_members": 3,
            "visibility": "PUBLIC",
            "skills_needed": ["Solar Thermal", "Thermodynamics", "CAD", "IoT"]
        }
        t_res = await client.post("/api/v1/teams", json=team_payload, headers=leader_auth["headers"])
        assert t_res.status_code == 201
        team_id = t_res.json()["data"]["id"]

        # Step 3: Student B submits join request
        r1_res = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "I specialize in thermodynamics."},
            headers=collaborator1_auth["headers"]
        )
        assert r1_res.status_code == 201
        r1_id = r1_res.json()["data"]["id"]

        # Step 4: Student B withdraws join request
        w_res = await client.post(f"/api/v1/teams/join-requests/{r1_id}/withdraw", headers=collaborator1_auth["headers"])
        assert w_res.status_code == 200

        # Step 5: Student B resubmits join request & Leader accepts
        r2_res = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Re-applying after schedule confirmation."},
            headers=collaborator1_auth["headers"]
        )
        r2_id = r2_res.json()["data"]["id"]
        acc_b = await client.post(
            f"/api/v1/teams/{team_id}/join-requests/{r2_id}/action",
            json={"action": "accept"},
            headers=leader_auth["headers"]
        )
        assert acc_b.status_code == 200

        # Step 6: Leader invites 2 Faculty Mentors
        inv_m1 = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": mentor1_auth["user_id"], "role": "MENTOR"},
            headers=leader_auth["headers"]
        )
        assert inv_m1.status_code == 201
        await client.post(f"/api/v1/teams/invitations/{inv_m1.json()['data']['id']}/action", json={"action": "accept"}, headers=mentor1_auth["headers"])

        inv_m2 = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": mentor2_auth["user_id"], "role": "MENTOR"},
            headers=leader_auth["headers"]
        )
        assert inv_m2.status_code == 201
        await client.post(f"/api/v1/teams/invitations/{inv_m2.json()['data']['id']}/action", json={"action": "accept"}, headers=mentor2_auth["headers"])

        # Step 7: Attempting to invite 3rd mentor fails with 409 MENTOR_CAPACITY_EXCEEDED
        inv_m3 = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": mentor3_auth["user_id"], "role": "MENTOR"},
            headers=leader_auth["headers"]
        )
        assert inv_m3.status_code == 409
        assert inv_m3.json()["error"]["code"] == "MENTOR_CAPACITY_EXCEEDED"

        # Step 8: Leader invites Student C as 3rd contributor
        inv_c = await client.post(
            f"/api/v1/teams/{team_id}/invitations",
            json={"user_id": collaborator2_auth["user_id"], "role": "MEMBER"},
            headers=leader_auth["headers"]
        )
        assert inv_c.status_code == 201
        # Student C accepts -> Team has 3 active contributors -> status auto-transitions to FULL
        await client.post(f"/api/v1/teams/invitations/{inv_c.json()['data']['id']}/action", json={"action": "accept"}, headers=collaborator2_auth["headers"])

        t_full = await client.get(f"/api/v1/teams/{team_id}", headers=leader_auth["headers"])
        assert t_full.json()["data"]["status"] == "FULL"
        assert t_full.json()["data"]["active_contributors_count"] == 3
        assert t_full.json()["data"]["active_mentors_count"] == 2

        # Step 9: Student D attempts to apply to FULL team -> 409/400 rejected
        r_d = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Applying to full team."},
            headers=collaborator3_auth["headers"]
        )
        assert r_d.status_code in (400, 409)

        # Step 10: Student B leaves team -> active contributors = 2 -> status auto-reverts to OPEN
        leave_b = await client.post(f"/api/v1/teams/{team_id}/leave", headers=collaborator1_auth["headers"])
        assert leave_b.status_code == 200

        t_open = await client.get(f"/api/v1/teams/{team_id}", headers=leader_auth["headers"])
        assert t_open.json()["data"]["status"] == "OPEN"
        assert t_open.json()["data"]["active_contributors_count"] == 2

        # Step 11: Leader promotes Student C to CO_LEADER
        prom_c = await client.patch(
            f"/api/v1/teams/{team_id}/members/{collaborator2_auth['user_id']}/role",
            json={"role": "CO_LEADER"},
            headers=leader_auth["headers"]
        )
        assert prom_c.status_code == 200

        # Step 12: Leader transfers primary leadership to Student C
        trans_res = await client.post(
            f"/api/v1/teams/{team_id}/transfer-leadership",
            json={"new_leader_id": collaborator2_auth["user_id"]},
            headers=leader_auth["headers"]
        )
        assert trans_res.status_code == 200

        # Step 13: New Leader (Student C) disbands team
        disband_res = await client.delete(f"/api/v1/teams/{team_id}", headers=collaborator2_auth["headers"])
        assert disband_res.status_code == 200
        assert disband_res.json()["data"]["status"] == "DISBANDED"

        # Step 14: All subsequent actions on disbanded team are blocked with 400 INVALID_TEAM_STATE
        post_disband_apply = await client.post(
            f"/api/v1/teams/{team_id}/join-requests",
            json={"message": "Applying to disbanded team."},
            headers=collaborator3_auth["headers"]
        )
        assert post_disband_apply.status_code == 400
        assert post_disband_apply.json()["error"]["code"] == "INVALID_TEAM_STATE"
