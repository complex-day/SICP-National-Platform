from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.project import (
    InnovationProjectCreate,
    InnovationProjectUpdate,
    InnovationProjectResponse,
    InnovationProjectDetailResponse,
    ProjectActivateRequest,
    ProjectStageTransitionRequest,
    ProjectCompletionRequest,
    ProjectSuspendRequest,
    ProjectMilestoneCreate,
    ProjectMilestoneUpdate,
    ProjectMilestoneResponse,
    ProjectDeliverableCreate,
    ProjectDeliverableResponse,
    ProjectReviewCreate,
    ProjectReviewResponse,
    ProjectUpdateCreate,
    ProjectUpdateResponse,
)
from app.schemas.common import StandardResponse
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Innovation Project Lifecycle"])


# --- Project Endpoints ---

@router.post("", response_model=StandardResponse[InnovationProjectResponse], status_code=status.HTTP_201_CREATED)
async def create_project(
    data: InnovationProjectCreate,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.STUDENT, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    project = await ProjectService.create_project(db, data, current_user, ip_address=ip_address)
    return StandardResponse(data=project)


@router.get("", response_model=StandardResponse[List[InnovationProjectResponse]])
async def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    challenge_id: Optional[UUID] = None,
    university_id: Optional[UUID] = None,
    department_id: Optional[UUID] = None,
    team_id: Optional[UUID] = None,
    mentor_id: Optional[UUID] = None,
    status: Optional[str] = None,
    current_stage: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    projects, _ = await ProjectService.list_projects(
        db,
        challenge_id=challenge_id,
        university_id=university_id,
        department_id=department_id,
        team_id=team_id,
        mentor_id=mentor_id,
        status=status,
        current_stage=current_stage,
        limit=limit,
        offset=offset,
    )
    return StandardResponse(data=projects)


@router.get("/{project_id}", response_model=StandardResponse[InnovationProjectDetailResponse])
async def get_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    project = await ProjectService.get_project(db, project_id)
    return StandardResponse(data=project)


@router.patch("/{project_id}", response_model=StandardResponse[InnovationProjectResponse])
async def update_project(
    project_id: UUID,
    data: InnovationProjectUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    updated = await ProjectService.update_project_metadata(db, project_id, data, current_user, ip_address=ip_address)
    return StandardResponse(data=updated)


@router.post("/{project_id}/activate", response_model=StandardResponse[InnovationProjectResponse])
async def activate_project(
    project_id: UUID,
    data: ProjectActivateRequest,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.FACULTY, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    activated = await ProjectService.activate_project(db, project_id, data, current_user, ip_address=ip_address)
    return StandardResponse(data=activated)


@router.post("/{project_id}/stage", response_model=StandardResponse[InnovationProjectResponse])
async def transition_project_stage(
    project_id: UUID,
    data: ProjectStageTransitionRequest,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.FACULTY, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    project = await ProjectService.transition_stage(db, project_id, data, current_user, ip_address=ip_address)
    return StandardResponse(data=project)


@router.post("/{project_id}/complete", response_model=StandardResponse[InnovationProjectResponse])
async def complete_project(
    project_id: UUID,
    data: ProjectCompletionRequest,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.FACULTY, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    project = await ProjectService.complete_project(db, project_id, data, current_user, ip_address=ip_address)
    return StandardResponse(data=project)


@router.post("/{project_id}/suspend", response_model=StandardResponse[InnovationProjectResponse])
async def suspend_project(
    project_id: UUID,
    data: ProjectSuspendRequest,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    project = await ProjectService.suspend_project(db, project_id, data, current_user, ip_address=ip_address)
    return StandardResponse(data=project)


@router.post("/{project_id}/resume", response_model=StandardResponse[InnovationProjectResponse])
async def resume_project(
    project_id: UUID,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    project = await ProjectService.resume_project(db, project_id, current_user, ip_address=ip_address)
    return StandardResponse(data=project)


# --- Milestone Endpoints ---

@router.post("/{project_id}/milestones", response_model=StandardResponse[ProjectMilestoneResponse], status_code=status.HTTP_201_CREATED)
async def create_milestone(
    project_id: UUID,
    data: ProjectMilestoneCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    milestone = await ProjectService.create_milestone(db, project_id, data, current_user, ip_address=ip_address)
    return StandardResponse(data=milestone)


@router.get("/{project_id}/milestones", response_model=StandardResponse[List[ProjectMilestoneResponse]])
async def get_milestones(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    milestones = await ProjectService.get_milestones(db, project_id)
    return StandardResponse(data=milestones)


@router.patch("/{project_id}/milestones/{milestone_id}", response_model=StandardResponse[ProjectMilestoneResponse])
async def update_milestone(
    project_id: UUID,
    milestone_id: UUID,
    data: ProjectMilestoneUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    milestone = await ProjectService.update_milestone(db, milestone_id, data, current_user, ip_address=ip_address)
    return StandardResponse(data=milestone)


@router.post("/{project_id}/milestones/{milestone_id}/submit", response_model=StandardResponse[ProjectMilestoneResponse])
async def submit_milestone(
    project_id: UUID,
    milestone_id: UUID,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.STUDENT, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    milestone = await ProjectService.submit_milestone(db, project_id, milestone_id, current_user, ip_address=ip_address)
    return StandardResponse(data=milestone)


@router.post("/{project_id}/milestones/{milestone_id}/reviews", response_model=StandardResponse[ProjectReviewResponse], status_code=status.HTTP_201_CREATED)
async def review_milestone(
    project_id: UUID,
    milestone_id: UUID,
    data: ProjectReviewCreate,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.FACULTY, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    review = await ProjectService.review_milestone(db, project_id, milestone_id, data, current_user, ip_address=ip_address)
    return StandardResponse(data=review)


# --- Deliverable Endpoints ---

@router.post("/{project_id}/deliverables", response_model=StandardResponse[ProjectDeliverableResponse], status_code=status.HTTP_201_CREATED)
async def create_deliverable(
    project_id: UUID,
    data: ProjectDeliverableCreate,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.STUDENT, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    deliverable = await ProjectService.create_deliverable(db, project_id, data, current_user, ip_address=ip_address)
    return StandardResponse(data=deliverable)


# --- Project Updates Endpoints ---

@router.post("/{project_id}/updates", response_model=StandardResponse[ProjectUpdateResponse], status_code=status.HTTP_201_CREATED)
async def create_update(
    project_id: UUID,
    data: ProjectUpdateCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    update_obj = await ProjectService.create_update(db, project_id, data, current_user, ip_address=ip_address)
    return StandardResponse(data=update_obj)


@router.get("/{project_id}/updates", response_model=StandardResponse[List[ProjectUpdateResponse]])
async def get_updates(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    updates = await ProjectService.get_updates(db, project_id)
    return StandardResponse(data=updates)
