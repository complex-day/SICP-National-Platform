import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.constants import TeamStatus, TeamVisibility, TeamMemberRole, TeamMemberStatus
from app.models.team import Team, TeamMember
from app.models.challenge import Challenge
from app.models.user import User


class TeamRepository:
    """Data access layer for Team entities."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_team(
        self,
        name: str,
        description: str,
        challenge_id: uuid.UUID,
        created_by: uuid.UUID,
        max_members: int = 5,
        visibility: TeamVisibility = TeamVisibility.PUBLIC,
        skills_needed: Optional[List[str]] = None
    ) -> Team:
        """Create a new Team record."""
        team = Team(
            name=name,
            description=description,
            challenge_id=challenge_id,
            created_by=created_by,
            max_members=max_members,
            status=TeamStatus.OPEN.value,
            visibility=visibility.value if isinstance(visibility, TeamVisibility) else visibility,
            skills_needed=skills_needed or [],
            version=1,
            is_deleted=False
        )
        self.session.add(team)
        await self.session.commit()
        await self.session.refresh(team)
        return team

    async def get_team_by_id(self, team_id: uuid.UUID) -> Optional[Team]:
        """Fetch a team by ID with members and challenge loaded."""
        stmt = (
            select(Team)
            .options(
                selectinload(Team.members).selectinload(TeamMember.user),
                selectinload(Team.challenge),
                selectinload(Team.creator)
            )
            .where(Team.id == team_id, Team.is_deleted == False)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_team_with_lock(self, team_id: uuid.UUID) -> Optional[Team]:
        """Fetch team with pessimistic row locking (SELECT FOR UPDATE)."""
        stmt = (
            select(Team)
            .where(Team.id == team_id, Team.is_deleted == False)
            .with_for_update()
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_team(self, team: Team, updates: Dict[str, Any]) -> Team:
        """Apply updates and increment optimistic locking version."""
        for key, value in updates.items():
            if hasattr(team, key):
                if isinstance(value, (TeamVisibility, TeamStatus)):
                    setattr(team, key, value.value)
                else:
                    setattr(team, key, value)
        team.version += 1
        await self.session.commit()
        await self.session.refresh(team)
        return team

    async def update_team_status(self, team_id: uuid.UUID, new_status: TeamStatus) -> Optional[Team]:
        """Change team status."""
        team = await self.get_team_by_id(team_id)
        if team:
            team.status = new_status.value if isinstance(new_status, TeamStatus) else new_status
            await self.session.commit()
            await self.session.refresh(team)
        return team

    async def count_active_contributors(self, team_id: uuid.UUID) -> int:
        """Count active student contributors (LEADER, CO_LEADER, MEMBER)."""
        contributor_roles = [
            TeamMemberRole.LEADER.value,
            TeamMemberRole.CO_LEADER.value,
            TeamMemberRole.MEMBER.value
        ]
        stmt = select(func.count(TeamMember.id)).where(
            TeamMember.team_id == team_id,
            TeamMember.status == TeamMemberStatus.ACTIVE.value,
            TeamMember.role.in_(contributor_roles),
            TeamMember.is_deleted == False
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def count_active_mentors(self, team_id: uuid.UUID) -> int:
        """Count active mentors (MENTOR role)."""
        stmt = select(func.count(TeamMember.id)).where(
            TeamMember.team_id == team_id,
            TeamMember.status == TeamMemberStatus.ACTIVE.value,
            TeamMember.role == TeamMemberRole.MENTOR.value,
            TeamMember.is_deleted == False
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def check_user_active_challenge_participation(
        self, user_id: uuid.UUID, challenge_id: uuid.UUID
    ) -> bool:
        """Check if user is already an ACTIVE member in any team anchored to challenge_id."""
        stmt = (
            select(TeamMember.id)
            .join(Team, Team.id == TeamMember.team_id)
            .where(
                TeamMember.user_id == user_id,
                TeamMember.status == TeamMemberStatus.ACTIVE.value,
                TeamMember.is_deleted == False,
                Team.challenge_id == challenge_id,
                Team.is_deleted == False,
                Team.status != TeamStatus.DISBANDED.value
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def check_user_active_challenge_ownership(
        self, user_id: uuid.UUID, challenge_id: uuid.UUID
    ) -> bool:
        """Check if user already owns an active team on challenge_id (FR-M3-15)."""
        stmt = (
            select(Team.id)
            .where(
                Team.created_by == user_id,
                Team.challenge_id == challenge_id,
                Team.is_deleted == False,
                Team.status.in_([TeamStatus.OPEN.value, TeamStatus.FULL.value, TeamStatus.LOCKED.value])
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def list_teams(
        self,
        challenge_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        skill: Optional[str] = None,
        search: Optional[str] = None,
        visibility: Optional[str] = TeamVisibility.PUBLIC.value,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Team], int]:
        """List and filter discoverable teams with pagination."""
        query = (
            select(Team)
            .options(
                selectinload(Team.members).selectinload(TeamMember.user),
                selectinload(Team.creator)
            )
            .where(Team.is_deleted == False, Team.status != TeamStatus.DISBANDED.value)
        )

        if visibility:
            query = query.where(Team.visibility == visibility)

        if challenge_id:
            query = query.where(Team.challenge_id == challenge_id)

        if status:
            query = query.where(Team.status == status)

        if search:
            pattern = f"%{search}%"
            query = query.where(
                or_(
                    Team.name.ilike(pattern),
                    Team.description.ilike(pattern)
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar() or 0

        # Execute pagination
        offset = (page - 1) * page_size
        query = query.order_by(Team.created_at.desc()).offset(offset).limit(page_size)
        result = await self.session.execute(query)
        teams = list(result.scalars().all())

        # Skill filtering in python if JSON array overlap needed
        if skill:
            filtered_teams = []
            for t in teams:
                if t.skills_needed and any(skill.lower() == str(s).lower() for s in t.skills_needed):
                    filtered_teams.append(t)
            return filtered_teams, len(filtered_teams)

        return teams, total

    async def get_my_teams(self, user_id: uuid.UUID) -> List[Team]:
        """Fetch all teams where the user is a creator or an active/pending member."""
        stmt = (
            select(Team)
            .join(TeamMember, TeamMember.team_id == Team.id)
            .options(
                selectinload(Team.members).selectinload(TeamMember.user),
                selectinload(Team.creator)
            )
            .where(
                TeamMember.user_id == user_id,
                TeamMember.is_deleted == False,
                TeamMember.status.in_([
                    TeamMemberStatus.ACTIVE.value,
                    TeamMemberStatus.INVITED.value,
                    TeamMemberStatus.REQUESTED.value
                ]),
                Team.is_deleted == False
            )
            .order_by(Team.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())


class TeamMemberRepository:
    """Data access layer for TeamMember records."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_member(
        self,
        team_id: uuid.UUID,
        user_id: uuid.UUID,
        role: TeamMemberRole = TeamMemberRole.MEMBER,
        status: TeamMemberStatus = TeamMemberStatus.REQUESTED,
        invited_by: Optional[uuid.UUID] = None,
        message: Optional[str] = None,
        expires_at: Optional[datetime] = None,
        joined_at: Optional[datetime] = None
    ) -> TeamMember:
        """Create a new membership or recruitment record."""
        member = TeamMember(
            team_id=team_id,
            user_id=user_id,
            role=role.value if isinstance(role, TeamMemberRole) else role,
            status=status.value if isinstance(status, TeamMemberStatus) else status,
            invited_by=invited_by,
            message=message,
            expires_at=expires_at,
            joined_at=joined_at,
            is_deleted=False
        )
        self.session.add(member)
        await self.session.commit()
        await self.session.refresh(member)
        return member

    async def get_member_by_id(self, member_id: uuid.UUID) -> Optional[TeamMember]:
        """Fetch member by ID with user and team loaded."""
        stmt = (
            select(TeamMember)
            .options(
                selectinload(TeamMember.user),
                selectinload(TeamMember.team),
                selectinload(TeamMember.inviter)
            )
            .where(TeamMember.id == member_id, TeamMember.is_deleted == False)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_active_or_pending_member(
        self, team_id: uuid.UUID, user_id: uuid.UUID
    ) -> Optional[TeamMember]:
        """Find active, invited, or requested member for a given user in a team."""
        stmt = (
            select(TeamMember)
            .where(
                TeamMember.team_id == team_id,
                TeamMember.user_id == user_id,
                TeamMember.is_deleted == False,
                TeamMember.status.in_([
                    TeamMemberStatus.ACTIVE.value,
                    TeamMemberStatus.INVITED.value,
                    TeamMemberStatus.REQUESTED.value
                ])
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_members_by_team(
        self, team_id: uuid.UUID, status: Optional[str] = None
    ) -> List[TeamMember]:
        """List members of a team."""
        query = (
            select(TeamMember)
            .options(selectinload(TeamMember.user))
            .where(TeamMember.team_id == team_id, TeamMember.is_deleted == False)
        )
        if status:
            query = query.where(TeamMember.status == status)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def list_invitations_for_user(self, user_id: uuid.UUID) -> List[TeamMember]:
        """List active unexpired invitations received by a user."""
        stmt = (
            select(TeamMember)
            .options(selectinload(TeamMember.team), selectinload(TeamMember.inviter))
            .where(
                TeamMember.user_id == user_id,
                TeamMember.status == TeamMemberStatus.INVITED.value,
                TeamMember.is_deleted == False
            )
            .order_by(TeamMember.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_join_requests_for_team(self, team_id: uuid.UUID) -> List[TeamMember]:
        """List pending join requests for a team."""
        stmt = (
            select(TeamMember)
            .options(selectinload(TeamMember.user))
            .where(
                TeamMember.team_id == team_id,
                TeamMember.status == TeamMemberStatus.REQUESTED.value,
                TeamMember.is_deleted == False
            )
            .order_by(TeamMember.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update_member_status(
        self, member_id: uuid.UUID, new_status: TeamMemberStatus, joined_at: Optional[datetime] = None
    ) -> Optional[TeamMember]:
        """Update member status and joined timestamp."""
        member = await self.get_member_by_id(member_id)
        if member:
            member.status = new_status.value if isinstance(new_status, TeamMemberStatus) else new_status
            if joined_at is not None:
                member.joined_at = joined_at
            await self.session.commit()
            await self.session.refresh(member)
        return member

    async def update_member_role(
        self, member_id: uuid.UUID, new_role: TeamMemberRole
    ) -> Optional[TeamMember]:
        """Promote or demote member role."""
        member = await self.get_member_by_id(member_id)
        if member:
            member.role = new_role.value if isinstance(new_role, TeamMemberRole) else new_role
            await self.session.commit()
            await self.session.refresh(member)
        return member

    async def count_co_leaders(self, team_id: uuid.UUID) -> int:
        """Count active co-leaders in a team (max 2)."""
        stmt = select(func.count(TeamMember.id)).where(
            TeamMember.team_id == team_id,
            TeamMember.role == TeamMemberRole.CO_LEADER.value,
            TeamMember.status == TeamMemberStatus.ACTIVE.value,
            TeamMember.is_deleted == False
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def mark_all_members_left(self, team_id: uuid.UUID) -> None:
        """Mark all active/pending members as LEFT upon team disbandment."""
        stmt = (
            update(TeamMember)
            .where(
                TeamMember.team_id == team_id,
                TeamMember.status.in_([
                    TeamMemberStatus.ACTIVE.value,
                    TeamMemberStatus.INVITED.value,
                    TeamMemberStatus.REQUESTED.value
                ])
            )
            .values(status=TeamMemberStatus.LEFT.value)
        )
        await self.session.execute(stmt)
        await self.session.commit()
