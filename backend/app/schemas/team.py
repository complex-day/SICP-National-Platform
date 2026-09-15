import uuid
from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.core.constants import TeamStatus, TeamVisibility, TeamMemberRole, TeamMemberStatus


class TeamCreateRequest(BaseModel):
    """Schema for creating a new collaborative team anchored to a challenge."""
    name: str = Field(..., min_length=3, max_length=100, description="Unique team name")
    description: str = Field(..., min_length=20, max_length=1000, description="Detailed problem statement & solution approach")
    challenge_id: uuid.UUID = Field(..., description="Mandatory ID of the linked verified challenge")
    max_members: int = Field(default=5, ge=2, le=6, description="Max active student contributors (2-6)")
    visibility: TeamVisibility = Field(default=TeamVisibility.PUBLIC, description="Discoverability tier")
    skills_needed: Optional[List[str]] = Field(default=None, description="Required skill tags (max 10)")

    @field_validator("name")
    @classmethod
    def trim_name(cls, v: str) -> str:
        trimmed = v.strip()
        if len(trimmed) < 3:
            raise ValueError("Team name must contain at least 3 characters after trimming")
        return trimmed

    @field_validator("skills_needed")
    @classmethod
    def validate_skills_needed(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None:
            if len(v) > 10:
                raise ValueError("Cannot specify more than 10 required skills")
            return [s.strip() for s in v if s.strip()]
        return v


class TeamUpdateRequest(BaseModel):
    """Schema for editing team metadata and vacancy settings."""
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=20, max_length=1000)
    max_members: Optional[int] = Field(None, ge=2, le=6)
    visibility: Optional[TeamVisibility] = None
    skills_needed: Optional[List[str]] = None

    @field_validator("name")
    @classmethod
    def trim_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if len(trimmed) < 3:
                raise ValueError("Team name must contain at least 3 characters after trimming")
            return trimmed
        return v

    @field_validator("skills_needed")
    @classmethod
    def validate_skills_needed(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None:
            if len(v) > 10:
                raise ValueError("Cannot specify more than 10 required skills")
            return [s.strip() for s in v if s.strip()]
        return v


class TeamStatusUpdateRequest(BaseModel):
    """Schema for locking/unlocking recruitment."""
    status: TeamStatus = Field(..., description="Target status (OPEN or LOCKED)")

    @field_validator("status")
    @classmethod
    def validate_status_toggle(cls, v: TeamStatus) -> TeamStatus:
        if v not in (TeamStatus.OPEN, TeamStatus.LOCKED):
            raise ValueError("Only OPEN and LOCKED statuses can be toggled via status endpoint")
        return v


class TeamJoinRequestCreate(BaseModel):
    """Schema for candidate submitting an inbound join request."""
    message: Optional[str] = Field(None, max_length=500, description="Pitch or statement of interest")


class TeamJoinRequestAction(BaseModel):
    """Schema for leader/co-leader accepting or rejecting a join request."""
    action: Literal["accept", "reject"] = Field(..., description="Decision action")


class TeamInviteCreate(BaseModel):
    """Schema for leader inviting a student contributor or faculty/industry mentor."""
    user_id: uuid.UUID = Field(..., description="Target user ID to invite")
    role: TeamMemberRole = Field(default=TeamMemberRole.MEMBER, description="Assigned role (MEMBER or MENTOR)")
    message: Optional[str] = Field(None, max_length=500, description="Invitation note")


class TeamInviteAction(BaseModel):
    """Schema for invitee accepting or declining an invitation."""
    action: Literal["accept", "decline"] = Field(..., description="Decision action")


class TeamMemberRoleUpdate(BaseModel):
    """Schema for promoting/demoting team members."""
    role: TeamMemberRole = Field(..., description="Target role (MEMBER or CO_LEADER)")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: TeamMemberRole) -> TeamMemberRole:
        if v not in (TeamMemberRole.MEMBER, TeamMemberRole.CO_LEADER):
            raise ValueError("Can only promote/demote between MEMBER and CO_LEADER")
        return v


class TeamTransferLeadershipRequest(BaseModel):
    """Schema for transferring primary team leadership."""
    new_leader_id: uuid.UUID = Field(..., description="User ID of active member to become the new LEADER")


# --- Response Payloads ---

class TeamMemberBriefData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    name: Optional[str] = None
    email: Optional[str] = None
    role: TeamMemberRole
    status: TeamMemberStatus
    message: Optional[str] = None
    expires_at: Optional[datetime] = None
    joined_at: Optional[datetime] = None
    created_at: datetime


class TeamSummaryData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: str
    challenge_id: uuid.UUID
    created_by: uuid.UUID
    leader_name: Optional[str] = None
    max_members: int
    active_contributors_count: int
    active_mentors_count: int
    vacancies_count: int
    status: TeamStatus
    visibility: TeamVisibility
    skills_needed: Optional[List[str]] = None
    created_at: datetime


class TeamDetailData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: str
    challenge_id: uuid.UUID
    challenge_title: Optional[str] = None
    created_by: uuid.UUID
    max_members: int
    status: TeamStatus
    visibility: TeamVisibility
    skills_needed: Optional[List[str]] = None
    version: int
    created_at: datetime
    updated_at: datetime
    members: List[TeamMemberBriefData] = []
    active_contributors_count: int = 0
    active_mentors_count: int = 0


class TeamResponseData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: str
    challenge_id: uuid.UUID
    created_by: uuid.UUID
    max_members: int
    status: TeamStatus
    visibility: TeamVisibility
    skills_needed: Optional[List[str]] = None
    version: int
    created_at: datetime
    updated_at: datetime


class TeamMemberData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    team_id: uuid.UUID
    user_id: uuid.UUID
    role: TeamMemberRole
    status: TeamMemberStatus
    invited_by: Optional[uuid.UUID] = None
    message: Optional[str] = None
    expires_at: Optional[datetime] = None
    joined_at: Optional[datetime] = None
    created_at: datetime


class TeamJoinRequestData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    team_id: uuid.UUID
    user_id: uuid.UUID
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    message: Optional[str] = None
    status: TeamMemberStatus
    created_at: datetime


class TeamInviteData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    team_id: uuid.UUID
    team_name: Optional[str] = None
    user_id: uuid.UUID
    invited_by: Optional[uuid.UUID] = None
    role: TeamMemberRole
    status: TeamMemberStatus
    message: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime


class PaginatedTeamsData(BaseModel):
    items: List[TeamSummaryData]
    total: int
    page: int
    page_size: int
    total_pages: int
