import uuid
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import TeamStatus, TeamVisibility, TeamMemberRole, TeamMemberStatus
from app.models.team import Team, TeamMember
from app.models.challenge import Challenge
from app.models.user import User, UserRole, UserStatus
from app.models.role_profiles import CitizenProfile, FacultyProfile, StudentProfile
from app.repositories.team_repository import TeamRepository, TeamMemberRepository


@pytest.mark.asyncio
class TestTeamRepository:
    """Repository layer tests for TeamRepository and TeamMemberRepository."""

    async def _create_test_user(self, session: AsyncSession, email: str, role: str = "student") -> User:
        user = User(
            email=email,
            password_hash="hashed_pw",
            full_name="Test User",
            role=role,
            status=UserStatus.ACTIVE.value if hasattr(UserStatus.ACTIVE, "value") else str(UserStatus.ACTIVE)
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        if role == "citizen":
            profile = CitizenProfile(user_id=user.id, district="Ranchi", state="Jharkhand")
            session.add(profile)
        elif role == "faculty":
            profile = FacultyProfile(user_id=user.id)
            session.add(profile)
        elif role == "student":
            profile = StudentProfile(user_id=user.id)
            session.add(profile)
        await session.commit()
        return user

    async def _create_test_challenge(self, session: AsyncSession, creator_id: uuid.UUID) -> Challenge:
        citizen_user = await self._create_test_user(session, f"citizen_{uuid.uuid4().hex[:6]}@test.com", role="citizen")
        challenge = Challenge(
            citizen_id=citizen_user.id,
            created_by=creator_id,
            title="Clean Drinking Water Initiative",
            description="Providing bio-filtration units across 10 rural villages.",
            category="Water",
            affected_population=5000,
            latitude=23.3441,
            longitude=85.3096,
            status="published",
            visibility="PUBLIC"
        )
        session.add(challenge)
        await session.commit()
        await session.refresh(challenge)
        return challenge

    async def test_create_and_get_team(self, db_session: AsyncSession):
        """Verify creating and retrieving a team record."""
        user = await self._create_test_user(db_session, "creator1@test.com")
        challenge = await self._create_test_challenge(db_session, user.id)

        team_repo = TeamRepository(db_session)
        team = await team_repo.create_team(
            name="Water Innovators",
            description="A multidisciplinary team tackling water quality.",
            challenge_id=challenge.id,
            created_by=user.id,
            max_members=4,
            visibility=TeamVisibility.PUBLIC,
            skills_needed=["IoT", "Chemistry"]
        )
        assert team.id is not None
        assert team.name == "Water Innovators"
        assert team.status == TeamStatus.OPEN
        assert team.version == 1

        fetched = await team_repo.get_team_by_id(team.id)
        assert fetched is not None
        assert fetched.id == team.id
        assert fetched.challenge_id == challenge.id

    async def test_active_contributor_and_mentor_counts(self, db_session: AsyncSession):
        """Verify distinct contributor vs. mentor active count queries."""
        u_leader = await self._create_test_user(db_session, "leader_counts@test.com")
        u_member = await self._create_test_user(db_session, "member_counts@test.com")
        u_mentor1 = await self._create_test_user(db_session, "mentor1_counts@test.com", role="faculty")
        u_mentor2 = await self._create_test_user(db_session, "mentor2_counts@test.com", role="faculty")
        challenge = await self._create_test_challenge(db_session, u_leader.id)

        team_repo = TeamRepository(db_session)
        member_repo = TeamMemberRepository(db_session)

        team = await team_repo.create_team(
            name="Count Test Team",
            description="Testing contributor and mentor capacity counters.",
            challenge_id=challenge.id,
            created_by=u_leader.id,
            max_members=3
        )

        # Add Leader (ACTIVE, LEADER) -> contributor
        await member_repo.create_member(
            team_id=team.id,
            user_id=u_leader.id,
            role=TeamMemberRole.LEADER,
            status=TeamMemberStatus.ACTIVE
        )
        # Add Member (ACTIVE, MEMBER) -> contributor
        await member_repo.create_member(
            team_id=team.id,
            user_id=u_member.id,
            role=TeamMemberRole.MEMBER,
            status=TeamMemberStatus.ACTIVE
        )
        # Add Mentor 1 (ACTIVE, MENTOR) -> mentor
        await member_repo.create_member(
            team_id=team.id,
            user_id=u_mentor1.id,
            role=TeamMemberRole.MENTOR,
            status=TeamMemberStatus.ACTIVE
        )
        # Add Mentor 2 (ACTIVE, MENTOR) -> mentor
        await member_repo.create_member(
            team_id=team.id,
            user_id=u_mentor2.id,
            role=TeamMemberRole.MENTOR,
            status=TeamMemberStatus.ACTIVE
        )

        contributors_count = await team_repo.count_active_contributors(team.id)
        mentors_count = await team_repo.count_active_mentors(team.id)

        assert contributors_count == 2
        assert mentors_count == 2

    async def test_check_user_active_challenge_participation(self, db_session: AsyncSession):
        """Verify detection of active membership on a challenge (FR-M3-14)."""
        u_student = await self._create_test_user(db_session, "student_part@test.com")
        challenge = await self._create_test_challenge(db_session, u_student.id)

        team_repo = TeamRepository(db_session)
        member_repo = TeamMemberRepository(db_session)

        team = await team_repo.create_team(
            name="Participation Team A",
            description="First team on this challenge.",
            challenge_id=challenge.id,
            created_by=u_student.id,
            max_members=5
        )

        # Before activation -> False
        is_part = await team_repo.check_user_active_challenge_participation(u_student.id, challenge.id)
        assert is_part is False

        # Activate membership
        await member_repo.create_member(
            team_id=team.id,
            user_id=u_student.id,
            role=TeamMemberRole.LEADER,
            status=TeamMemberStatus.ACTIVE
        )

        is_part_now = await team_repo.check_user_active_challenge_participation(u_student.id, challenge.id)
        assert is_part_now is True

    async def test_check_user_active_challenge_ownership(self, db_session: AsyncSession):
        """Verify single team ownership constraint per challenge (FR-M3-15)."""
        u_owner = await self._create_test_user(db_session, "owner_test@test.com")
        challenge = await self._create_test_challenge(db_session, u_owner.id)

        team_repo = TeamRepository(db_session)

        has_active = await team_repo.check_user_active_challenge_ownership(u_owner.id, challenge.id)
        assert has_active is False

        team = await team_repo.create_team(
            name="Owner Test Team",
            description="Testing single ownership rule on challenge.",
            challenge_id=challenge.id,
            created_by=u_owner.id,
            max_members=4
        )

        has_active_now = await team_repo.check_user_active_challenge_ownership(u_owner.id, challenge.id)
        assert has_active_now is True

        # Disband team
        await team_repo.update_team_status(team.id, TeamStatus.DISBANDED)
        has_active_disbanded = await team_repo.check_user_active_challenge_ownership(u_owner.id, challenge.id)
        assert has_active_disbanded is False

    async def test_list_teams_catalog(self, db_session: AsyncSession):
        """Verify catalog filtering and pagination."""
        u_creator = await self._create_test_user(db_session, "catalog_creator@test.com")
        challenge = await self._create_test_challenge(db_session, u_creator.id)

        team_repo = TeamRepository(db_session)
        await team_repo.create_team(
            name="IoT Sensor Network Squad",
            description="Building long-range LoRa sensors for soil moisture.",
            challenge_id=challenge.id,
            created_by=u_creator.id,
            max_members=4,
            skills_needed=["IoT", "Python", "Hardware"]
        )

        teams, total = await team_repo.list_teams(
            challenge_id=challenge.id,
            skill="IoT",
            search="Sensor",
            page=1,
            page_size=10
        )
        assert total >= 1
        assert len(teams) >= 1
        assert "IoT" in teams[0].skills_needed
