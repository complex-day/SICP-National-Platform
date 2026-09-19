from datetime import datetime, date
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator
import re

from app.core.constants import (
    ProjectStatus,
    ProjectStage,
    ProjectOutcome,
    MilestoneStatus,
    DeliverableType,
    ReviewDecision,
    UpdateType,
)


# --- Project Milestone Schemas ---

class ProjectMilestoneBase(BaseModel):
    sequence_index: int = Field(..., ge=1, description="Sequential index of the milestone (1-indexed)")
    title: str = Field(..., min_length=3, max_length=255, description="Title of the milestone")
    description: str = Field(..., min_length=10, description="Detailed description of the milestone tasks")
    weight: int = Field(..., ge=1, le=100, description="Integer percentage weight towards total project (1-100)")
    is_mandatory: bool = Field(default=True, description="Whether this milestone is mandatory for project completion")
    due_date: date = Field(..., description="Target completion deadline")
    acceptance_criteria: Optional[List[str]] = Field(default_factory=list, description="Verifiable acceptance criteria list")


class ProjectMilestoneCreate(ProjectMilestoneBase):
    pass


class ProjectMilestoneUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    weight: Optional[int] = Field(None, ge=1, le=100)
    is_mandatory: Optional[bool] = None
    due_date: Optional[date] = None
    acceptance_criteria: Optional[List[str]] = None


class ProjectMilestoneResponse(ProjectMilestoneBase):
    id: UUID
    project_id: UUID
    status: MilestoneStatus
    completed_at: Optional[datetime] = None
    created_by: UUID
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Project Deliverable Schemas ---

class ProjectDeliverableBase(BaseModel):
    milestone_id: UUID = Field(..., description="Milestone ID this deliverable satisfies")
    deliverable_type: DeliverableType = Field(..., description="Artifact category")
    title: str = Field(..., min_length=3, max_length=255, description="Deliverable title or artifact name")
    asset_url: str = Field(..., min_length=5, max_length=1000, description="Storage URL or Repository/Demo URL")
    file_name: Optional[str] = Field(None, max_length=255)
    mime_type: Optional[str] = Field(None, max_length=100)
    file_size_bytes: Optional[int] = Field(None, ge=0)
    sha256_hash: Optional[str] = Field(None, min_length=64, max_length=64, description="Hex-encoded SHA-256 digest")
    parent_deliverable_id: Optional[UUID] = Field(None, description="Previous deliverable version ID if this is a revision")
    metadata_info: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator("sha256_hash")
    @classmethod
    def validate_sha256(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            if not re.match(r"^[a-f0-9]{64}$", v):
                raise ValueError("sha256_hash must be a 64-character hexadecimal string.")
        return v


class ProjectDeliverableCreate(ProjectDeliverableBase):
    pass


class ProjectDeliverableResponse(ProjectDeliverableBase):
    id: UUID
    project_id: UUID
    uploader_id: UUID
    version_number: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Project Review Schemas ---

class ProjectReviewCreate(BaseModel):
    decision: ReviewDecision = Field(..., description="Review outcome: APPROVED, CHANGES_REQUESTED, REJECTED")
    score: int = Field(..., ge=0, le=100, description="Numerical evaluation score (0-100)")
    rubric_breakdown: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Detailed score breakdown")
    feedback: str = Field(..., min_length=5, description="Detailed qualitative feedback")
    is_final_signoff: bool = Field(default=False, description="Whether this certifies final project completion")


class ProjectReviewResponse(BaseModel):
    id: UUID
    milestone_id: UUID
    project_id: UUID
    reviewer_id: UUID
    decision: ReviewDecision
    score: int
    rubric_breakdown: Optional[Dict[str, Any]] = None
    feedback: str
    is_final_signoff: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Project Update / Sprint Log Schemas ---

class ProjectUpdateCreate(BaseModel):
    update_type: UpdateType = Field(default=UpdateType.SPRINT_LOG, description="Classification of the progress update")
    title: str = Field(..., min_length=3, max_length=255)
    content: str = Field(..., min_length=10, description="Sprint notes, blocker description, or lab observations")
    attachments: Optional[List[str]] = Field(default_factory=list)


class ProjectUpdateResponse(BaseModel):
    id: UUID
    project_id: UUID
    author_id: UUID
    update_type: UpdateType
    title: str
    content: str
    attachments: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Innovation Project Aggregate Schemas ---

class InnovationProjectBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255, description="Project title")
    abstract: str = Field(..., min_length=20, description="Technical summary of the proposed solution")
    repository_url: Optional[str] = Field(None, max_length=500, description="VCS repository URL (GitHub/GitLab)")
    demo_url: Optional[str] = Field(None, max_length=500, description="Live prototype or video demonstration URL")
    tech_stack: Optional[List[str]] = Field(default_factory=list, description="Technologies, frameworks, and hardware used")
    target_completion_date: Optional[date] = Field(None, description="Target deployment date")


class InnovationProjectCreate(InnovationProjectBase):
    intake_team_allocation_id: UUID = Field(..., description="Verified M4 intake team allocation ID")
    secondary_mentor_id: Optional[UUID] = Field(None, description="Optional secondary co-mentor or technical advisor")


class InnovationProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    abstract: Optional[str] = Field(None, min_length=20)
    repository_url: Optional[str] = Field(None, max_length=500)
    demo_url: Optional[str] = Field(None, max_length=500)
    tech_stack: Optional[List[str]] = None
    target_completion_date: Optional[date] = None
    secondary_mentor_id: Optional[UUID] = None
    version: Optional[int] = Field(None, description="Expected version for optimistic concurrency control")


class ProjectActivateRequest(BaseModel):
    version: Optional[int] = Field(None, description="Expected project version")


class ProjectStageTransitionRequest(BaseModel):
    new_stage: ProjectStage = Field(..., description="Target engineering stage")
    reason: Optional[str] = Field(None, max_length=500)
    version: Optional[int] = Field(None, description="Expected project version")


class ProjectSuspendRequest(BaseModel):
    reason: str = Field(..., min_length=5, description="Reason for administrative suspension")
    version: Optional[int] = Field(None, description="Expected project version")


class ProjectCompletionRequest(BaseModel):
    outcome: ProjectOutcome = Field(default=ProjectOutcome.SUCCESS, description="Evaluation outcome for M7 analytics")
    feedback: str = Field(..., min_length=10, description="Final mentor/institutional evaluation summary")
    score: int = Field(..., ge=0, le=100, description="Final score (0-100)")
    version: Optional[int] = Field(None, description="Expected project version")


class InnovationProjectResponse(InnovationProjectBase):
    id: UUID
    intake_team_allocation_id: UUID
    challenge_id: UUID
    team_id: UUID
    university_id: UUID
    department_id: UUID
    primary_faculty_mentor_id: UUID
    secondary_mentor_id: Optional[UUID] = None
    status: ProjectStatus
    current_stage: ProjectStage
    project_outcome: Optional[ProjectOutcome] = None
    progress_percentage: int
    actual_completion_date: Optional[datetime] = None
    closure_reason: Optional[str] = None
    created_by: UUID
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InnovationProjectDetailResponse(InnovationProjectResponse):
    milestones: List[ProjectMilestoneResponse] = Field(default_factory=list)
    deliverables: List[ProjectDeliverableResponse] = Field(default_factory=list)
    updates: List[ProjectUpdateResponse] = Field(default_factory=list)
