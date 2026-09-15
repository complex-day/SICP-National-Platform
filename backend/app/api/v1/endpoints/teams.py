import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole, TeamMemberRole, TeamMemberStatus, TeamStatus, TeamVisibility
from app.db.session import get_db
from app.api.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.common import StandardResponse
from app.schemas.team import (
    TeamCreateRequest,
    TeamUpdateRequest,
    TeamStatusUpdateRequest,
    TeamJoinRequestCreate,
    TeamJoinRequestAction,
    TeamInviteCreate,
    TeamInviteAction,
    TeamMemberRoleUpdate,
    TeamTransferLeadershipRequest,
    TeamResponseData,
    TeamDetailData,
    TeamSummaryData,
    TeamMemberData,
    TeamJoinRequestData,
    TeamInviteData,
    PaginatedTeamsData
)
from app.services.team_service import TeamService

router = APIRouter(prefix="/teams", tags=["Team Formation & Collaboration"])


# --- Team Creation & Catalog ---

@router.post(
    "",
    response_model=StandardResponse[TeamResponseData],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new collaborative team anchored to a challenge"
)
async def create_team(
    payload: TeamCreateRequest,
    current_user: User = Depends(require_roles([UserRole.STUDENT, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    team = await service.create_team(current_user, payload)
    return StandardResponse(
        success=True,
        data=TeamResponseData.model_validate(team)
    )


@router.get(
    "",
    response_model=StandardResponse[PaginatedTeamsData],
    summary="List discoverable public teams with multi-attribute filtering"
)
async def list_teams(
    challenge_id: Optional[uuid.UUID] = Query(None, description="Filter by anchored challenge ID"),
    status: Optional[str] = Query(None, description="Filter by status (OPEN, FULL, LOCKED)"),
    skill: Optional[str] = Query(None, description="Filter by required skill keyword"),
    search: Optional[str] = Query(None, description="Search query across team name and description"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    paginated = await service.list_teams(
        challenge_id=challenge_id,
        status=status,
        skill=skill,
        search=search,
        page=page,
        page_size=page_size
    )
    return StandardResponse(success=True, data=paginated)


@router.get(
    "/my-teams",
    response_model=StandardResponse[List[TeamSummaryData]],
    summary="List teams where the authenticated user is an active or pending member"
)
async def get_my_teams(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    teams = await service.get_my_teams(current_user)
    return StandardResponse(success=True, data=teams)


@router.get(
    "/invitations/me",
    response_model=StandardResponse[List[TeamInviteData]],
    summary="List unexpired invitations received by current user"
)
async def get_my_invitations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    invitations = await service.list_my_invitations(current_user)
    items = []
    for inv in invitations:
        items.append(
            TeamInviteData(
                id=inv.id,
                team_id=inv.team_id,
                team_name=inv.team.name if inv.team else None,
                user_id=inv.user_id,
                invited_by=inv.invited_by,
                role=TeamMemberRole(inv.role),
                status=TeamMemberStatus(inv.status),
                message=inv.message,
                expires_at=inv.expires_at,
                created_at=inv.created_at
            )
        )
    return StandardResponse(success=True, data=items)


@router.post(
    "/join-requests/{request_id}/withdraw",
    response_model=StandardResponse[TeamMemberData],
    summary="Applicant voluntarily withdraws a pending join request"
)
async def withdraw_join_request(
    request_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    member = await service.withdraw_join_request(current_user, request_id)
    return StandardResponse(
        success=True,
        data=TeamMemberData.model_validate(member)
    )


@router.post(
    "/invitations/{member_id}/action",
    response_model=StandardResponse[TeamMemberData],
    summary="Accept or decline a team invitation"
)
async def action_invitation(
    member_id: uuid.UUID,
    payload: TeamInviteAction,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    member = await service.action_invitation(current_user, member_id, payload.action)
    return StandardResponse(
        success=True,
        data=TeamMemberData.model_validate(member)
    )


# --- Single Team Profile, Mutators & Governance ---

@router.get(
    "/{id}",
    response_model=StandardResponse[TeamDetailData],
    summary="Get full team profile and roster"
)
async def get_team_detail(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    detail = await service.get_team_detail(id)
    return StandardResponse(success=True, data=detail)


@router.patch(
    "/{id}",
    response_model=StandardResponse[TeamResponseData],
    summary="Edit team metadata, max capacity, or required skills"
)
async def update_team(
    id: uuid.UUID,
    payload: TeamUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    team = await service.update_team(current_user, id, payload)
    return StandardResponse(
        success=True,
        data=TeamResponseData.model_validate(team)
    )


@router.patch(
    "/{id}/status",
    response_model=StandardResponse[TeamResponseData],
    summary="Lock or unlock team recruitment"
)
async def update_team_status(
    id: uuid.UUID,
    payload: TeamStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    team = await service.update_team_status(current_user, id, payload)
    return StandardResponse(
        success=True,
        data=TeamResponseData.model_validate(team)
    )


@router.delete(
    "/{id}",
    response_model=StandardResponse[TeamResponseData],
    summary="Disband team and close all collaborative activity"
)
async def disband_team(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    team = await service.disband_team(current_user, id)
    return StandardResponse(
        success=True,
        data=TeamResponseData.model_validate(team)
    )


# --- Recruitment: Inbound Join Requests ---

@router.post(
    "/{id}/join-requests",
    response_model=StandardResponse[TeamJoinRequestData],
    status_code=status.HTTP_201_CREATED,
    summary="Submit an inbound application to join an open team"
)
async def create_join_request(
    id: uuid.UUID,
    payload: TeamJoinRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    member = await service.create_join_request(current_user, id, payload)
    return StandardResponse(
        success=True,
        data=TeamJoinRequestData(
            id=member.id,
            team_id=member.team_id,
            user_id=member.user_id,
            user_name=current_user.full_name,
            user_email=current_user.email,
            message=member.message,
            status=TeamMemberStatus(member.status),
            created_at=member.created_at
        )
    )


@router.get(
    "/{id}/join-requests",
    response_model=StandardResponse[List[TeamJoinRequestData]],
    summary="List pending join requests for a team (Leader/Co-Leader only)"
)
async def list_join_requests(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    requests = await service.list_join_requests(current_user, id)
    items = []
    for req in requests:
        items.append(
            TeamJoinRequestData(
                id=req.id,
                team_id=req.team_id,
                user_id=req.user_id,
                user_name=req.user.full_name if req.user else None,
                user_email=req.user.email if req.user else None,
                message=req.message,
                status=TeamMemberStatus(req.status),
                created_at=req.created_at
            )
        )
    return StandardResponse(success=True, data=items)


@router.post(
    "/{id}/join-requests/{member_id}/action",
    response_model=StandardResponse[TeamMemberData],
    summary="Accept or reject a candidate join request"
)
async def action_join_request(
    id: uuid.UUID,
    member_id: uuid.UUID,
    payload: TeamJoinRequestAction,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    member = await service.action_join_request(current_user, id, member_id, payload.action)
    return StandardResponse(
        success=True,
        data=TeamMemberData.model_validate(member)
    )


# --- Recruitment: Outbound Invitations ---

@router.post(
    "/{id}/invitations",
    response_model=StandardResponse[TeamInviteData],
    status_code=status.HTTP_201_CREATED,
    summary="Proactively invite a student contributor or faculty/industry mentor"
)
async def create_invitation(
    id: uuid.UUID,
    payload: TeamInviteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    member = await service.create_invitation(current_user, id, payload)
    return StandardResponse(
        success=True,
        data=TeamInviteData(
            id=member.id,
            team_id=member.team_id,
            user_id=member.user_id,
            invited_by=member.invited_by,
            role=TeamMemberRole(member.role),
            status=TeamMemberStatus(member.status),
            message=member.message,
            expires_at=member.expires_at,
            created_at=member.created_at
        )
    )


# --- Membership Operations ---

@router.post(
    "/{id}/leave",
    response_model=StandardResponse[TeamMemberData],
    summary="Voluntarily leave an active team"
)
async def leave_team(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    member = await service.leave_team(current_user, id)
    return StandardResponse(
        success=True,
        data=TeamMemberData.model_validate(member)
    )


@router.delete(
    "/{id}/members/{user_id}",
    response_model=StandardResponse[TeamMemberData],
    summary="Evict a member from the team roster"
)
async def remove_member(
    id: uuid.UUID,
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    member = await service.remove_member(current_user, id, user_id)
    return StandardResponse(
        success=True,
        data=TeamMemberData.model_validate(member)
    )


@router.patch(
    "/{id}/members/{user_id}/role",
    response_model=StandardResponse[TeamMemberData],
    summary="Promote or demote member between MEMBER and CO_LEADER"
)
async def update_member_role(
    id: uuid.UUID,
    user_id: uuid.UUID,
    payload: TeamMemberRoleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    member = await service.update_member_role(current_user, id, user_id, payload)
    return StandardResponse(
        success=True,
        data=TeamMemberData.model_validate(member)
    )


@router.post(
    "/{id}/transfer-leadership",
    response_model=StandardResponse[TeamResponseData],
    summary="Transfer primary team leadership to an active member"
)
async def transfer_leadership(
    id: uuid.UUID,
    payload: TeamTransferLeadershipRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = TeamService(db)
    team = await service.transfer_leadership(current_user, id, payload.new_leader_id)
    return StandardResponse(
        success=True,
        data=TeamResponseData.model_validate(team)
    )
