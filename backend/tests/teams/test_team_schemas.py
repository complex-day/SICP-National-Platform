import uuid
import pytest
from pydantic import ValidationError

from app.core.constants import TeamStatus, TeamVisibility, TeamMemberRole, TeamMemberStatus
from app.schemas.team import (
    TeamCreateRequest,
    TeamUpdateRequest,
    TeamStatusUpdateRequest,
    TeamJoinRequestCreate,
    TeamJoinRequestAction,
    TeamInviteCreate,
    TeamInviteAction,
    TeamMemberRoleUpdate,
    TeamTransferLeadershipRequest
)


class TestTeamSchemaValidation:
    """Pydantic schema validation boundary tests for Module 3 (Team Formation & Collaboration)."""

    def test_team_create_valid(self):
        """TEST-TEAM-SCH-001: Valid Team Creation Payload."""
        cid = uuid.uuid4()
        payload = {
            "name": "Smart Water Filtration Squad",
            "description": "Designing a solar-powered bio-sand filtration unit for arsenic mitigation in rural blocks.",
            "challenge_id": str(cid),
            "max_members": 5,
            "visibility": TeamVisibility.PUBLIC,
            "skills_needed": ["Python", "Embedded Systems", "Water Quality", "CAD Design"]
        }
        schema = TeamCreateRequest(**payload)
        assert schema.name == "Smart Water Filtration Squad"
        assert schema.challenge_id == cid
        assert schema.max_members == 5
        assert len(schema.skills_needed) == 4

    def test_team_create_missing_challenge_id(self):
        """TEST-TEAM-SCH-002: Missing Mandatory Challenge ID must raise ValidationError."""
        payload = {
            "name": "Generic Innovation Team",
            "description": "A team created without an anchored societal challenge.",
            "max_members": 4,
            "visibility": TeamVisibility.PUBLIC
        }
        with pytest.raises(ValidationError) as exc:
            TeamCreateRequest(**payload)
        assert "challenge_id" in str(exc.value)

    def test_team_create_name_bounds(self):
        """TEST-TEAM-SCH-003: Team name validation (< 3 chars or > 100 chars)."""
        cid = uuid.uuid4()
        # Too short
        with pytest.raises(ValidationError):
            TeamCreateRequest(
                name="AI",
                description="A valid description with more than twenty characters.",
                challenge_id=cid,
                max_members=4
            )
        # Too long (> 100 chars)
        with pytest.raises(ValidationError):
            TeamCreateRequest(
                name="A" * 101,
                description="A valid description with more than twenty characters.",
                challenge_id=cid,
                max_members=4
            )

    def test_team_create_description_bounds(self):
        """TEST-TEAM-SCH-004: Description validation (< 20 chars or > 1000 chars)."""
        cid = uuid.uuid4()
        # Too short (< 20 chars)
        with pytest.raises(ValidationError):
            TeamCreateRequest(
                name="Valid Name",
                description="Short desc",
                challenge_id=cid,
                max_members=4
            )
        # Too long (> 1000 chars)
        with pytest.raises(ValidationError):
            TeamCreateRequest(
                name="Valid Name",
                description="X" * 1001,
                challenge_id=cid,
                max_members=4
            )

    def test_team_create_max_members_below_min(self):
        """TEST-TEAM-SCH-005: Max Members below minimum (< 2)."""
        cid = uuid.uuid4()
        with pytest.raises(ValidationError):
            TeamCreateRequest(
                name="Solo Innovator Team",
                description="A valid description with more than twenty characters.",
                challenge_id=cid,
                max_members=1
            )

    def test_team_create_max_members_above_max(self):
        """TEST-TEAM-SCH-006: Max Members above maximum (> 6)."""
        cid = uuid.uuid4()
        with pytest.raises(ValidationError):
            TeamCreateRequest(
                name="Massive Mega Team",
                description="A valid description with more than twenty characters.",
                challenge_id=cid,
                max_members=7
            )

    def test_team_create_skills_list_limit(self):
        """TEST-TEAM-SCH-007: Skills list exceeds 10 items limit."""
        cid = uuid.uuid4()
        with pytest.raises(ValidationError):
            TeamCreateRequest(
                name="Skill Collectors Squad",
                description="A valid description with more than twenty characters.",
                challenge_id=cid,
                max_members=5,
                skills_needed=[f"Skill_{i}" for i in range(11)]
            )

    def test_team_join_request_message_limit(self):
        """TEST-TEAM-SCH-010: Join Request message exceeds 500 chars."""
        with pytest.raises(ValidationError):
            TeamJoinRequestCreate(message="M" * 501)

    def test_team_join_request_valid(self):
        """TEST-TEAM-SCH-011: Valid Join Request Create and Action schemas."""
        req = TeamJoinRequestCreate(message="I have expertise in Arduino and PCB design.")
        assert req.message == "I have expertise in Arduino and PCB design."

        action_accept = TeamJoinRequestAction(action="accept")
        assert action_accept.action == "accept"
        action_reject = TeamJoinRequestAction(action="reject")
        assert action_reject.action == "reject"

        with pytest.raises(ValidationError):
            TeamJoinRequestAction(action="invalid_action")

    def test_team_invite_schemas(self):
        """TEST-TEAM-SCH-013: Valid Invite Create and Action schemas."""
        uid = uuid.uuid4()
        invite = TeamInviteCreate(user_id=uid, role=TeamMemberRole.MEMBER, message="Join our team!")
        assert invite.user_id == uid
        assert invite.role == TeamMemberRole.MEMBER

        mentor_invite = TeamInviteCreate(user_id=uid, role=TeamMemberRole.MENTOR)
        assert mentor_invite.role == TeamMemberRole.MENTOR

        action_accept = TeamInviteAction(action="accept")
        assert action_accept.action == "accept"
        action_decline = TeamInviteAction(action="decline")
        assert action_decline.action == "decline"

    def test_team_management_schemas(self):
        """TEST-TEAM-SCH-012: Team update, role change, and leadership transfer schemas."""
        update = TeamUpdateRequest(
            name="Updated Name Squad",
            description="Updated description with more than twenty characters.",
            max_members=6,
            skills_needed=["React", "NodeJS"]
        )
        assert update.name == "Updated Name Squad"
        assert update.max_members == 6

        status_update = TeamStatusUpdateRequest(status=TeamStatus.LOCKED)
        assert status_update.status == TeamStatus.LOCKED

        role_update = TeamMemberRoleUpdate(role=TeamMemberRole.CO_LEADER)
        assert role_update.role == TeamMemberRole.CO_LEADER

        uid = uuid.uuid4()
        transfer = TeamTransferLeadershipRequest(new_leader_id=uid)
        assert transfer.new_leader_id == uid
