import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    TeamStatus,
    TeamVisibility,
    TeamMemberRole,
    TeamMemberStatus,
    AuditAction,
    UserRole
)
from app.core.exceptions import (
    NotFoundError,
    AuthorizationError,
    ConflictError,
    BadRequestError,
    InvalidTeamStateError,
    TeamCapacityExceededError,
    MentorCapacityExceededError,
    DuplicateTeamMembershipError,
    DuplicateTeamOwnershipError,
    InvitationExpiredError,
    ValidationException
)
from app.models.user import User
from app.models.team import Team, TeamMember
from app.schemas.team import (
    TeamCreateRequest,
    TeamUpdateRequest,
    TeamStatusUpdateRequest,
    TeamJoinRequestCreate,
    TeamInviteCreate,
    TeamMemberRoleUpdate,
    TeamDetailData,
    TeamSummaryData,
    TeamMemberBriefData,
    PaginatedTeamsData
)
from app.repositories.team_repository import TeamRepository, TeamMemberRepository
from app.repositories.audit_repository import AuditRepository
from app.repositories.challenge_repository import ChallengeRepository
from app.repositories.user_repository import UserRepository


class TeamService:
    """Domain service for Team Formation, Collaboration, Recruitment and Governance."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.team_repo = TeamRepository(session)
        self.member_repo = TeamMemberRepository(session)
        self.audit_repo = AuditRepository(session)
        self.challenge_repo = ChallengeRepository(session)
        self.user_repo = UserRepository(session)

    # --- Team Management ---

    async def create_team(self, current_user: User, data: TeamCreateRequest) -> Team:
        """Create a new team strictly linked to a verified challenge."""
        # 1. Verify Challenge exists and is published/active
        challenge = await self.challenge_repo.get_by_id(data.challenge_id)
        if not challenge:
            raise NotFoundError("Linked challenge does not exist")

        # 2. FR-M3-15: Single active team ownership per challenge check
        has_ownership = await self.team_repo.check_user_active_challenge_ownership(
            current_user.id, data.challenge_id
        )
        if has_ownership:
            raise DuplicateTeamOwnershipError(
                "You already own an active team for this challenge. Disband your existing team first."
            )

        # 3. FR-M3-14: Single active participation per challenge check
        has_part = await self.team_repo.check_user_active_challenge_participation(
            current_user.id, data.challenge_id
        )
        if has_part:
            raise DuplicateTeamMembershipError(
                "You are already an active member of a team solving this challenge."
            )

        # 4. Create Team
        team = await self.team_repo.create_team(
            name=data.name,
            description=data.description,
            challenge_id=data.challenge_id,
            created_by=current_user.id,
            max_members=data.max_members,
            visibility=data.visibility,
            skills_needed=data.skills_needed
        )

        # 5. Automatically add Creator as ACTIVE LEADER
        await self.member_repo.create_member(
            team_id=team.id,
            user_id=current_user.id,
            role=TeamMemberRole.LEADER,
            status=TeamMemberStatus.ACTIVE,
            joined_at=datetime.now(timezone.utc)
        )

        # 6. Audit Logging
        await self.audit_repo.log(
            action=AuditAction.TEAM_CREATED.value,
            entity_type="team",
            entity_id=team.id,
            user_id=current_user.id,
            metadata={
                "name": team.name,
                "challenge_id": str(team.challenge_id),
                "max_members": team.max_members,
                "visibility": team.visibility
            }
        )

        return team

    async def get_team_detail(self, team_id: uuid.UUID) -> TeamDetailData:
        """Fetch full team detail including roster, active counts, and challenge information."""
        team = await self.team_repo.get_team_by_id(team_id)
        if not team:
            raise NotFoundError("Team not found")

        contributors_count = await self.team_repo.count_active_contributors(team_id)
        mentors_count = await self.team_repo.count_active_mentors(team_id)

        member_briefs = []
        for m in team.members:
            if not m.is_deleted:
                member_briefs.append(
                    TeamMemberBriefData(
                        id=m.id,
                        user_id=m.user_id,
                        name=m.user.full_name if m.user else None,
                        email=m.user.email if m.user else None,
                        role=TeamMemberRole(m.role),
                        status=TeamMemberStatus(m.status),
                        message=m.message,
                        expires_at=m.expires_at,
                        joined_at=m.joined_at,
                        created_at=m.created_at
                    )
                )

        return TeamDetailData(
            id=team.id,
            name=team.name,
            description=team.description,
            challenge_id=team.challenge_id,
            challenge_title=team.challenge.title if team.challenge else None,
            created_by=team.created_by,
            max_members=team.max_members,
            status=TeamStatus(team.status),
            visibility=TeamVisibility(team.visibility),
            skills_needed=team.skills_needed,
            version=team.version,
            created_at=team.created_at,
            updated_at=team.updated_at,
            members=member_briefs,
            active_contributors_count=contributors_count,
            active_mentors_count=mentors_count
        )

    async def list_teams(
        self,
        challenge_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        skill: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> PaginatedTeamsData:
        """List discoverable public teams."""
        teams, total = await self.team_repo.list_teams(
            challenge_id=challenge_id,
            status=status,
            skill=skill,
            search=search,
            visibility=TeamVisibility.PUBLIC.value,
            page=page,
            page_size=page_size
        )

        items = []
        for t in teams:
            contrib_cnt = await self.team_repo.count_active_contributors(t.id)
            mentor_cnt = await self.team_repo.count_active_mentors(t.id)
            vacancies = max(0, t.max_members - contrib_cnt)

            items.append(
                TeamSummaryData(
                    id=t.id,
                    name=t.name,
                    description=t.description,
                    challenge_id=t.challenge_id,
                    created_by=t.created_by,
                    leader_name=t.creator.full_name if t.creator else None,
                    max_members=t.max_members,
                    active_contributors_count=contrib_cnt,
                    active_mentors_count=mentor_cnt,
                    vacancies_count=vacancies,
                    status=TeamStatus(t.status),
                    visibility=TeamVisibility(t.visibility),
                    skills_needed=t.skills_needed,
                    created_at=t.created_at
                )
            )

        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1
        return PaginatedTeamsData(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    async def get_my_teams(self, current_user: User) -> List[TeamSummaryData]:
        """List all teams where current user is active or has pending invites/requests."""
        teams = await self.team_repo.get_my_teams(current_user.id)
        items = []
        for t in teams:
            contrib_cnt = await self.team_repo.count_active_contributors(t.id)
            mentor_cnt = await self.team_repo.count_active_mentors(t.id)
            vacancies = max(0, t.max_members - contrib_cnt)

            items.append(
                TeamSummaryData(
                    id=t.id,
                    name=t.name,
                    description=t.description,
                    challenge_id=t.challenge_id,
                    created_by=t.created_by,
                    leader_name=t.creator.full_name if t.creator else None,
                    max_members=t.max_members,
                    active_contributors_count=contrib_cnt,
                    active_mentors_count=mentor_cnt,
                    vacancies_count=vacancies,
                    status=TeamStatus(t.status),
                    visibility=TeamVisibility(t.visibility),
                    skills_needed=t.skills_needed,
                    created_at=t.created_at
                )
            )
        return items

    async def update_team(self, current_user: User, team_id: uuid.UUID, data: TeamUpdateRequest) -> Team:
        """Edit team details and settings."""
        team = await self.team_repo.get_team_by_id(team_id)
        if not team:
            raise NotFoundError("Team not found")

        # FR-M3-16 Disbanded protection
        if team.status == TeamStatus.DISBANDED.value:
            raise InvalidTeamStateError("Cannot modify a disbanded team")

        # Authorization: Leader, Co-Leader, or Admin
        await self._assert_team_admin(current_user, team_id)

        # Max members check
        if data.max_members is not None:
            active_contrib = await self.team_repo.count_active_contributors(team_id)
            if data.max_members < active_contrib:
                raise BadRequestError(
                    f"Cannot reduce max_members ({data.max_members}) below current active contributors count ({active_contrib})"
                )

        updates = data.model_dump(exclude_unset=True)
        updated_team = await self.team_repo.update_team(team, updates)

        # Status sync
        active_contrib = await self.team_repo.count_active_contributors(team_id)
        if active_contrib >= updated_team.max_members and updated_team.status == TeamStatus.OPEN.value:
            await self.team_repo.update_team_status(team_id, TeamStatus.FULL)
        elif active_contrib < updated_team.max_members and updated_team.status == TeamStatus.FULL.value:
            await self.team_repo.update_team_status(team_id, TeamStatus.OPEN)

        await self.audit_repo.log(
            action=AuditAction.TEAM_UPDATED.value,
            entity_type="team",
            entity_id=team_id,
            user_id=current_user.id,
            metadata=updates
        )
        return updated_team

    async def update_team_status(
        self, current_user: User, team_id: uuid.UUID, data: TeamStatusUpdateRequest
    ) -> Team:
        """Lock or unlock team recruitment."""
        team = await self.team_repo.get_team_by_id(team_id)
        if not team:
            raise NotFoundError("Team not found")

        if team.status == TeamStatus.DISBANDED.value:
            raise InvalidTeamStateError("Cannot change status of a disbanded team")

        # Only Leader or Admin can lock/unlock
        await self._assert_sole_leader_or_admin(current_user, team_id)

        target_status = data.status
        if target_status == TeamStatus.LOCKED:
            updated = await self.team_repo.update_team_status(team_id, TeamStatus.LOCKED)
            await self.audit_repo.log(
                action=AuditAction.TEAM_LOCKED.value,
                entity_type="team",
                entity_id=team_id,
                user_id=current_user.id,
                metadata={"status": TeamStatus.LOCKED.value}
            )
            return updated
        elif target_status == TeamStatus.OPEN:
            active_contrib = await self.team_repo.count_active_contributors(team_id)
            new_status = TeamStatus.FULL if active_contrib >= team.max_members else TeamStatus.OPEN
            updated = await self.team_repo.update_team_status(team_id, new_status)
            await self.audit_repo.log(
                action=AuditAction.TEAM_UNLOCKED.value,
                entity_type="team",
                entity_id=team_id,
                user_id=current_user.id,
                metadata={"status": new_status.value}
            )
            return updated

        return team

    async def disband_team(self, current_user: User, team_id: uuid.UUID) -> Team:
        """Disband a team and set status to terminal DISBANDED."""
        team = await self.team_repo.get_team_by_id(team_id)
        if not team:
            raise NotFoundError("Team not found")

        if team.status == TeamStatus.DISBANDED.value:
            return team

        await self._assert_sole_leader_or_admin(current_user, team_id)

        # Mark all members as LEFT
        await self.member_repo.mark_all_members_left(team_id)
        updated = await self.team_repo.update_team_status(team_id, TeamStatus.DISBANDED)

        await self.audit_repo.log(
            action=AuditAction.TEAM_DISBANDED.value,
            entity_type="team",
            entity_id=team_id,
            user_id=current_user.id,
            metadata={"disbanded_by": str(current_user.id)}
        )
        return updated

    # --- Recruitment & Join Requests ---

    async def create_join_request(
        self, current_user: User, team_id: uuid.UUID, data: TeamJoinRequestCreate
    ) -> TeamMember:
        """Submit an inbound join request to an open public team."""
        team = await self.team_repo.get_team_with_lock(team_id)
        if not team:
            raise NotFoundError("Team not found")

        if team.status == TeamStatus.DISBANDED.value:
            raise InvalidTeamStateError("Cannot apply to a disbanded team")

        if team.status == TeamStatus.LOCKED.value:
            raise InvalidTeamStateError("Team is currently locked and not accepting applications")

        if team.status == TeamStatus.FULL.value:
            raise TeamCapacityExceededError("Team has already reached maximum contributor capacity")

        # Capacity check
        active_contrib = await self.team_repo.count_active_contributors(team_id)
        if active_contrib >= team.max_members:
            raise TeamCapacityExceededError("Team is full")

        # FR-M3-14: Single active participation per challenge check
        has_part = await self.team_repo.check_user_active_challenge_participation(
            current_user.id, team.challenge_id
        )
        if has_part:
            raise DuplicateTeamMembershipError(
                "You are already an active member of another team on this challenge."
            )

        # Cross-channel membership integrity checks
        existing = await self.member_repo.get_active_or_pending_member(team_id, current_user.id)
        if existing:
            if existing.status == TeamMemberStatus.ACTIVE.value:
                raise ConflictError("You are already an active member of this team")
            elif existing.status == TeamMemberStatus.INVITED.value:
                raise ConflictError("You already have a pending invitation to this team")
            elif existing.status == TeamMemberStatus.REQUESTED.value:
                raise ConflictError("You already have a pending join request for this team")

        member = await self.member_repo.create_member(
            team_id=team_id,
            user_id=current_user.id,
            role=TeamMemberRole.MEMBER,
            status=TeamMemberStatus.REQUESTED,
            message=data.message
        )

        await self.audit_repo.log(
            action=AuditAction.JOIN_REQUEST_SENT.value,
            entity_type="team",
            entity_id=team_id,
            user_id=current_user.id,
            metadata={"applicant_id": str(current_user.id), "request_id": str(member.id)}
        )
        return member

    async def withdraw_join_request(
        self, current_user: User, request_id: uuid.UUID
    ) -> TeamMember:
        """Applicant voluntarily withdraws their pending join request."""
        member = await self.member_repo.get_member_by_id(request_id)
        if not member:
            raise NotFoundError("Join request not found")

        # Requester only or Admin
        if member.user_id != current_user.id and current_user.role != UserRole.ADMIN.value:
            raise AuthorizationError("Only the applicant can withdraw this join request")

        if member.status != TeamMemberStatus.REQUESTED.value:
            raise ConflictError(f"Cannot withdraw a request in status {member.status}")

        updated = await self.member_repo.update_member_status(request_id, TeamMemberStatus.WITHDRAWN)

        await self.audit_repo.log(
            action=AuditAction.JOIN_REQUEST_WITHDRAWN.value,
            entity_type="team",
            entity_id=member.team_id,
            user_id=current_user.id,
            metadata={"request_id": str(request_id), "applicant_id": str(member.user_id)}
        )
        return updated

    async def list_join_requests(
        self, current_user: User, team_id: uuid.UUID
    ) -> List[TeamMember]:
        """List all pending join requests for a team."""
        team = await self.team_repo.get_team_by_id(team_id)
        if not team:
            raise NotFoundError("Team not found")

        await self._assert_team_admin(current_user, team_id)
        return await self.member_repo.list_join_requests_for_team(team_id)

    async def action_join_request(
        self, current_user: User, team_id: uuid.UUID, member_id: uuid.UUID, action: str
    ) -> TeamMember:
        """Accept or reject a pending join request."""
        team = await self.team_repo.get_team_with_lock(team_id)
        if not team:
            raise NotFoundError("Team not found")

        if team.status == TeamStatus.DISBANDED.value:
            raise InvalidTeamStateError("Cannot process join requests for a disbanded team")

        await self._assert_team_admin(current_user, team_id)

        member = await self.member_repo.get_member_by_id(member_id)
        if not member or member.team_id != team_id or member.status != TeamMemberStatus.REQUESTED.value:
            raise BadRequestError("Join request is invalid or no longer pending")

        if action == "reject":
            updated = await self.member_repo.update_member_status(member_id, TeamMemberStatus.REJECTED)
            await self.audit_repo.log(
                action=AuditAction.JOIN_REQUEST_REJECTED.value,
                entity_type="team",
                entity_id=team_id,
                user_id=current_user.id,
                metadata={"member_id": str(member_id), "applicant_id": str(member.user_id)}
            )
            return updated

        elif action == "accept":
            # FR-M3-14: Single active participation check before activation
            has_part = await self.team_repo.check_user_active_challenge_participation(
                member.user_id, team.challenge_id
            )
            if has_part:
                raise DuplicateTeamMembershipError(
                    "Applicant is already an active member of another team on this challenge."
                )

            # Capacity check
            active_contrib = await self.team_repo.count_active_contributors(team_id)
            if active_contrib >= team.max_members:
                raise TeamCapacityExceededError("Team contributor capacity is full")

            updated = await self.member_repo.update_member_status(
                member_id, TeamMemberStatus.ACTIVE, joined_at=datetime.now(timezone.utc)
            )

            # Re-count and update team status to FULL if full
            new_contrib_cnt = await self.team_repo.count_active_contributors(team_id)
            if new_contrib_cnt >= team.max_members:
                await self.team_repo.update_team_status(team_id, TeamStatus.FULL)

            await self.audit_repo.log(
                action=AuditAction.JOIN_REQUEST_ACCEPTED.value,
                entity_type="team",
                entity_id=team_id,
                user_id=current_user.id,
                metadata={"member_id": str(member_id), "applicant_id": str(member.user_id)}
            )
            return updated

        raise BadRequestError("Action must be 'accept' or 'reject'")

    # --- Outbound Invitations ---

    async def create_invitation(
        self, current_user: User, team_id: uuid.UUID, data: TeamInviteCreate
    ) -> TeamMember:
        """Send an invitation to a student contributor or faculty/industry mentor."""
        team = await self.team_repo.get_team_with_lock(team_id)
        if not team:
            raise NotFoundError("Team not found")

        if team.status == TeamStatus.DISBANDED.value:
            raise InvalidTeamStateError("Cannot invite members to a disbanded team")

        if team.status == TeamStatus.LOCKED.value:
            raise InvalidTeamStateError("Cannot invite members while team is locked")

        await self._assert_team_admin(current_user, team_id)

        target_user = await self.user_repo.get_by_id(data.user_id)
        if not target_user:
            raise NotFoundError("Invited user not found")

        # Mentor governance check
        if data.role == TeamMemberRole.MENTOR:
            if target_user.role not in (UserRole.FACULTY.value, UserRole.INDUSTRY.value, UserRole.ADMIN.value):
                raise ValidationException("Mentors must possess faculty or industry platform role")
            active_mentors = await self.team_repo.count_active_mentors(team_id)
            if active_mentors >= 2:
                raise MentorCapacityExceededError("Team already has maximum allowed active mentors (2)")
        else:
            # Contributor check
            active_contrib = await self.team_repo.count_active_contributors(team_id)
            if active_contrib >= team.max_members:
                raise TeamCapacityExceededError("Team has reached maximum student contributor capacity")
            # FR-M3-14 Single participation check
            has_part = await self.team_repo.check_user_active_challenge_participation(
                target_user.id, team.challenge_id
            )
            if has_part:
                raise DuplicateTeamMembershipError("User is already in an active team for this challenge")

        # Cross-channel membership integrity
        existing = await self.member_repo.get_active_or_pending_member(team_id, data.user_id)
        if existing:
            if existing.status == TeamMemberStatus.ACTIVE.value:
                raise ConflictError("User is already an active member of this team")
            elif existing.status == TeamMemberStatus.INVITED.value:
                raise ConflictError("An invitation is already pending for this user")
            elif existing.status == TeamMemberStatus.REQUESTED.value:
                raise ConflictError("User already has a pending join request for this team")

        # 14-day expiration window
        expires_at = datetime.now(timezone.utc) + timedelta(days=14)

        member = await self.member_repo.create_member(
            team_id=team_id,
            user_id=data.user_id,
            role=data.role,
            status=TeamMemberStatus.INVITED,
            invited_by=current_user.id,
            message=data.message,
            expires_at=expires_at
        )

        await self.audit_repo.log(
            action=AuditAction.INVITATION_SENT.value,
            entity_type="team",
            entity_id=team_id,
            user_id=current_user.id,
            metadata={
                "invitee_id": str(data.user_id),
                "role": data.role.value,
                "expires_at": expires_at.isoformat()
            }
        )
        return member

    async def list_my_invitations(self, current_user: User) -> List[TeamMember]:
        """List active unexpired invitations received by current user."""
        return await self.member_repo.list_invitations_for_user(current_user.id)

    async def action_invitation(
        self, current_user: User, member_id: uuid.UUID, action: str
    ) -> TeamMember:
        """Accept or decline an unexpired invitation."""
        member = await self.member_repo.get_member_by_id(member_id)
        if not member:
            raise NotFoundError("Invitation not found")

        if member.user_id != current_user.id:
            raise AuthorizationError("You can only respond to invitations addressed to you")

        if member.status != TeamMemberStatus.INVITED.value:
            raise ConflictError(f"Invitation is no longer pending (current status: {member.status})")

        # Expiry Check
        if member.expires_at:
            exp_at = member.expires_at if member.expires_at.tzinfo is not None else member.expires_at.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > exp_at:
                await self.member_repo.update_member_status(member_id, TeamMemberStatus.EXPIRED)
                await self.audit_repo.log(
                    action=AuditAction.INVITATION_EXPIRED.value,
                    entity_type="team",
                    entity_id=member.team_id,
                    user_id=current_user.id,
                    metadata={"invitee_id": str(current_user.id), "expired_at": exp_at.isoformat()}
                )
                raise InvitationExpiredError("This invitation has expired")

        team = await self.team_repo.get_team_with_lock(member.team_id)
        if not team or team.status == TeamStatus.DISBANDED.value:
            raise InvalidTeamStateError("Team is disbanded or unavailable")

        if action == "decline":
            updated = await self.member_repo.update_member_status(member_id, TeamMemberStatus.LEFT)
            await self.audit_repo.log(
                action=AuditAction.INVITATION_DECLINED.value,
                entity_type="team",
                entity_id=team.id,
                user_id=current_user.id,
                metadata={"invitee_id": str(current_user.id)}
            )
            return updated

        elif action == "accept":
            if member.role == TeamMemberRole.MENTOR.value:
                active_mentors = await self.team_repo.count_active_mentors(team.id)
                if active_mentors >= 2:
                    raise MentorCapacityExceededError("Team mentor capacity is full (max 2 mentors)")
            else:
                active_contrib = await self.team_repo.count_active_contributors(team.id)
                if active_contrib >= team.max_members:
                    raise TeamCapacityExceededError("Team contributor capacity is full")

                has_part = await self.team_repo.check_user_active_challenge_participation(
                    current_user.id, team.challenge_id
                )
                if has_part:
                    raise DuplicateTeamMembershipError("You are already active in a team on this challenge")

            updated = await self.member_repo.update_member_status(
                member_id, TeamMemberStatus.ACTIVE, joined_at=datetime.now(timezone.utc)
            )

            # Check if team is now full
            new_contrib_cnt = await self.team_repo.count_active_contributors(team.id)
            if new_contrib_cnt >= team.max_members:
                await self.team_repo.update_team_status(team.id, TeamStatus.FULL)

            await self.audit_repo.log(
                action=AuditAction.INVITATION_ACCEPTED.value,
                entity_type="team",
                entity_id=team.id,
                user_id=current_user.id,
                metadata={"user_id": str(current_user.id), "role": member.role}
            )
            return updated

        raise BadRequestError("Action must be 'accept' or 'decline'")

    # --- Membership Governance ---

    async def leave_team(self, current_user: User, team_id: uuid.UUID) -> TeamMember:
        """Voluntarily leave a team."""
        member = await self.member_repo.get_active_or_pending_member(team_id, current_user.id)
        if not member or member.status != TeamMemberStatus.ACTIVE.value:
            raise NotFoundError("Active membership not found in this team")

        if member.role == TeamMemberRole.LEADER.value:
            raise BadRequestError("Team leader cannot leave without transferring primary leadership first")

        updated = await self.member_repo.update_member_status(member.id, TeamMemberStatus.LEFT)

        # If team was FULL, revert to OPEN
        team = await self.team_repo.get_team_by_id(team_id)
        if team and team.status == TeamStatus.FULL.value:
            await self.team_repo.update_team_status(team_id, TeamStatus.OPEN)

        await self.audit_repo.log(
            action=AuditAction.MEMBER_LEFT.value,
            entity_type="team",
            entity_id=team_id,
            user_id=current_user.id,
            metadata={"user_id": str(current_user.id)}
        )
        return updated

    async def remove_member(
        self, current_user: User, team_id: uuid.UUID, target_user_id: uuid.UUID
    ) -> TeamMember:
        """Leader or Co-Leader evicts a member."""
        team = await self.team_repo.get_team_by_id(team_id)
        if not team:
            raise NotFoundError("Team not found")

        if team.status == TeamStatus.DISBANDED.value:
            raise InvalidTeamStateError("Cannot remove members from a disbanded team")

        target_member = await self.member_repo.get_active_or_pending_member(team_id, target_user_id)
        if not target_member or target_member.status != TeamMemberStatus.ACTIVE.value:
            raise NotFoundError("Target active member not found in this team")

        if target_member.role == TeamMemberRole.LEADER.value:
            raise BadRequestError("Cannot remove the primary team leader")

        # Authorization check
        if current_user.role != UserRole.ADMIN.value:
            actor_member = await self.member_repo.get_active_or_pending_member(team_id, current_user.id)
            if not actor_member or actor_member.status != TeamMemberStatus.ACTIVE.value:
                raise AuthorizationError("You must be an active team admin to remove members")

            if actor_member.role == TeamMemberRole.CO_LEADER.value and target_member.role != TeamMemberRole.MEMBER.value:
                raise AuthorizationError("Co-Leaders can only remove regular members")
            elif actor_member.role not in (TeamMemberRole.LEADER.value, TeamMemberRole.CO_LEADER.value):
                raise AuthorizationError("Only Leaders and Co-Leaders can remove members")

        updated = await self.member_repo.update_member_status(target_member.id, TeamMemberStatus.REMOVED)

        # If team was FULL, revert to OPEN
        if team.status == TeamStatus.FULL.value:
            await self.team_repo.update_team_status(team_id, TeamStatus.OPEN)

        await self.audit_repo.log(
            action=AuditAction.MEMBER_REMOVED.value,
            entity_type="team",
            entity_id=team_id,
            user_id=current_user.id,
            metadata={"removed_user_id": str(target_user_id), "removed_by": str(current_user.id)}
        )
        return updated

    async def update_member_role(
        self, current_user: User, team_id: uuid.UUID, target_user_id: uuid.UUID, data: TeamMemberRoleUpdate
    ) -> TeamMember:
        """Promote or demote member between MEMBER and CO_LEADER."""
        team = await self.team_repo.get_team_by_id(team_id)
        if not team:
            raise NotFoundError("Team not found")

        if team.status == TeamStatus.DISBANDED.value:
            raise InvalidTeamStateError("Cannot change roles on a disbanded team")

        await self._assert_sole_leader_or_admin(current_user, team_id)

        target_member = await self.member_repo.get_active_or_pending_member(team_id, target_user_id)
        if not target_member or target_member.status != TeamMemberStatus.ACTIVE.value:
            raise NotFoundError("Active member not found")

        if target_member.role == TeamMemberRole.LEADER.value:
            raise BadRequestError("Cannot alter primary leader role via role update. Use transfer-leadership.")

        if data.role == TeamMemberRole.CO_LEADER:
            co_leaders_cnt = await self.member_repo.count_co_leaders(team_id)
            if co_leaders_cnt >= 2 and target_member.role != TeamMemberRole.CO_LEADER.value:
                raise ConflictError("Team already has maximum allowed Co-Leaders (2)")

        updated = await self.member_repo.update_member_role(target_member.id, data.role)

        await self.audit_repo.log(
            action=AuditAction.MEMBER_ROLE_CHANGED.value,
            entity_type="team",
            entity_id=team_id,
            user_id=current_user.id,
            metadata={"user_id": str(target_user_id), "new_role": data.role.value}
        )
        return updated

    async def transfer_leadership(
        self, current_user: User, team_id: uuid.UUID, new_leader_id: uuid.UUID
    ) -> Team:
        """Transfer primary leadership to an active member."""
        team = await self.team_repo.get_team_by_id(team_id)
        if not team:
            raise NotFoundError("Team not found")

        if team.status == TeamStatus.DISBANDED.value:
            raise InvalidTeamStateError("Cannot transfer leadership of a disbanded team")

        await self._assert_sole_leader_or_admin(current_user, team_id)

        if current_user.id == new_leader_id:
            raise BadRequestError("You are already the primary team leader")

        target_member = await self.member_repo.get_active_or_pending_member(team_id, new_leader_id)
        if not target_member or target_member.status != TeamMemberStatus.ACTIVE.value:
            raise BadRequestError("New leader must be an active participating member of the team")

        current_leader_member = await self.member_repo.get_active_or_pending_member(team_id, team.created_by)
        if current_leader_member:
            await self.member_repo.update_member_role(current_leader_member.id, TeamMemberRole.CO_LEADER)

        await self.member_repo.update_member_role(target_member.id, TeamMemberRole.LEADER)
        team.created_by = new_leader_id
        await self.session.commit()
        await self.session.refresh(team)

        await self.audit_repo.log(
            action=AuditAction.LEADERSHIP_TRANSFERRED.value,
            entity_type="team",
            entity_id=team_id,
            user_id=current_user.id,
            metadata={"old_leader": str(current_user.id), "new_leader": str(new_leader_id)}
        )
        return team

    # --- Authorization Helpers ---

    async def _assert_team_admin(self, user: User, team_id: uuid.UUID):
        if user.role == UserRole.ADMIN.value:
            return
        member = await self.member_repo.get_active_or_pending_member(team_id, user.id)
        if not member or member.status != TeamMemberStatus.ACTIVE.value:
            raise AuthorizationError("You are not an active member of this team")
        if member.role not in (TeamMemberRole.LEADER.value, TeamMemberRole.CO_LEADER.value):
            raise AuthorizationError("Only Leader and Co-Leaders can perform this action")

    async def _assert_sole_leader_or_admin(self, user: User, team_id: uuid.UUID):
        if user.role == UserRole.ADMIN.value:
            return
        member = await self.member_repo.get_active_or_pending_member(team_id, user.id)
        if not member or member.status != TeamMemberStatus.ACTIVE.value or member.role != TeamMemberRole.LEADER.value:
            raise AuthorizationError("Only the primary team leader can perform this action")
