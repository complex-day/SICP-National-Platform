import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.project import (
    InnovationProject,
    ProjectMilestone,
    ProjectDeliverable,
    ProjectReview,
    ProjectUpdate,
)
from app.core.constants import ProjectStatus, MilestoneStatus, ProjectStage


class ProjectRepository:
    """Repository handling database operations for the Innovation Project Lifecycle."""

    # --- Project Operations ---

    @staticmethod
    async def create_project(db: AsyncSession, project: InnovationProject) -> InnovationProject:
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def get_project_by_id(db: AsyncSession, project_id: uuid.UUID) -> Optional[InnovationProject]:
        stmt = (
            select(InnovationProject)
            .where(and_(InnovationProject.id == project_id, InnovationProject.is_deleted.is_(False)))
            .options(
                selectinload(InnovationProject.milestones),
                selectinload(InnovationProject.deliverables),
                selectinload(InnovationProject.updates),
                selectinload(InnovationProject.reviews),
                selectinload(InnovationProject.intake_allocation),
                selectinload(InnovationProject.team),
                selectinload(InnovationProject.university),
                selectinload(InnovationProject.department),
                selectinload(InnovationProject.primary_mentor),
                selectinload(InnovationProject.secondary_mentor),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_project_by_allocation_id(
        db: AsyncSession, allocation_id: uuid.UUID
    ) -> Optional[InnovationProject]:
        stmt = (
            select(InnovationProject)
            .where(
                and_(
                    InnovationProject.intake_team_allocation_id == allocation_id,
                    InnovationProject.is_deleted.is_(False),
                )
            )
            .options(
                selectinload(InnovationProject.milestones),
                selectinload(InnovationProject.deliverables),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_projects(
        db: AsyncSession,
        challenge_id: Optional[uuid.UUID] = None,
        university_id: Optional[uuid.UUID] = None,
        department_id: Optional[uuid.UUID] = None,
        team_id: Optional[uuid.UUID] = None,
        mentor_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        current_stage: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[InnovationProject], int]:
        filters = [InnovationProject.is_deleted.is_(False)]

        if challenge_id:
            filters.append(InnovationProject.challenge_id == challenge_id)
        if university_id:
            filters.append(InnovationProject.university_id == university_id)
        if department_id:
            filters.append(InnovationProject.department_id == department_id)
        if team_id:
            filters.append(InnovationProject.team_id == team_id)
        if mentor_id:
            filters.append(
                or_(
                    InnovationProject.primary_faculty_mentor_id == mentor_id,
                    InnovationProject.secondary_mentor_id == mentor_id,
                )
            )
        if status:
            filters.append(InnovationProject.status == status)
        if current_stage:
            filters.append(InnovationProject.current_stage == current_stage)

        # Count total matching records
        count_stmt = select(func.count(InnovationProject.id)).where(and_(*filters))
        count_result = await db.execute(count_stmt)
        total_count = count_result.scalar() or 0

        # Query paginated rows
        stmt = (
            select(InnovationProject)
            .where(and_(*filters))
            .options(
                selectinload(InnovationProject.milestones),
                selectinload(InnovationProject.deliverables),
                selectinload(InnovationProject.updates),
            )
            .order_by(InnovationProject.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(stmt)
        projects = list(result.scalars().all())
        return projects, total_count

    @staticmethod
    async def update_project(
        db: AsyncSession,
        project: InnovationProject,
        update_data: Dict[str, Any],
        expected_version: Optional[int] = None,
    ) -> InnovationProject:
        if expected_version is not None and project.version != expected_version:
            raise ValueError("OPTIMISTIC_LOCK_ERROR")

        for key, value in update_data.items():
            if hasattr(project, key) and value is not None:
                setattr(project, key, value)

        project.version += 1
        project.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(project)
        return project

    # --- Milestone Operations ---

    @staticmethod
    async def create_milestone(db: AsyncSession, milestone: ProjectMilestone) -> ProjectMilestone:
        db.add(milestone)
        await db.commit()
        await db.refresh(milestone)
        return milestone

    @staticmethod
    async def get_milestone_by_id(db: AsyncSession, milestone_id: uuid.UUID) -> Optional[ProjectMilestone]:
        stmt = (
            select(ProjectMilestone)
            .where(and_(ProjectMilestone.id == milestone_id, ProjectMilestone.is_deleted.is_(False)))
            .options(
                selectinload(ProjectMilestone.deliverables),
                selectinload(ProjectMilestone.reviews),
                selectinload(ProjectMilestone.project),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_milestones_by_project_id(
        db: AsyncSession, project_id: uuid.UUID
    ) -> List[ProjectMilestone]:
        stmt = (
            select(ProjectMilestone)
            .where(
                and_(
                    ProjectMilestone.project_id == project_id,
                    ProjectMilestone.is_deleted.is_(False),
                )
            )
            .options(
                selectinload(ProjectMilestone.deliverables),
                selectinload(ProjectMilestone.reviews),
            )
            .order_by(ProjectMilestone.sequence_index.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_milestone_by_sequence(
        db: AsyncSession, project_id: uuid.UUID, sequence_index: int
    ) -> Optional[ProjectMilestone]:
        stmt = select(ProjectMilestone).where(
            and_(
                ProjectMilestone.project_id == project_id,
                ProjectMilestone.sequence_index == sequence_index,
                ProjectMilestone.is_deleted.is_(False),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_milestone(
        db: AsyncSession,
        milestone: ProjectMilestone,
        update_data: Dict[str, Any],
        expected_version: Optional[int] = None,
    ) -> ProjectMilestone:
        if expected_version is not None and milestone.version != expected_version:
            raise ValueError("OPTIMISTIC_LOCK_ERROR")

        for key, value in update_data.items():
            if hasattr(milestone, key) and value is not None:
                setattr(milestone, key, value)

        milestone.version += 1
        milestone.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(milestone)
        return milestone

    # --- Deliverable Operations ---

    @staticmethod
    async def create_deliverable(db: AsyncSession, deliverable: ProjectDeliverable) -> ProjectDeliverable:
        db.add(deliverable)
        await db.commit()
        await db.refresh(deliverable)
        return deliverable

    @staticmethod
    async def get_deliverable_by_id(
        db: AsyncSession, deliverable_id: uuid.UUID
    ) -> Optional[ProjectDeliverable]:
        stmt = (
            select(ProjectDeliverable)
            .where(
                and_(
                    ProjectDeliverable.id == deliverable_id,
                    ProjectDeliverable.is_deleted.is_(False),
                )
            )
            .options(
                selectinload(ProjectDeliverable.milestone),
                selectinload(ProjectDeliverable.uploader),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_deliverables_by_milestone_id(
        db: AsyncSession, milestone_id: uuid.UUID
    ) -> List[ProjectDeliverable]:
        stmt = (
            select(ProjectDeliverable)
            .where(
                and_(
                    ProjectDeliverable.milestone_id == milestone_id,
                    ProjectDeliverable.is_deleted.is_(False),
                )
            )
            .order_by(ProjectDeliverable.version_number.desc(), ProjectDeliverable.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    # --- Review Operations ---

    @staticmethod
    async def create_review(db: AsyncSession, review: ProjectReview) -> ProjectReview:
        db.add(review)
        await db.commit()
        await db.refresh(review)
        return review

    @staticmethod
    async def get_reviews_by_milestone_id(
        db: AsyncSession, milestone_id: uuid.UUID
    ) -> List[ProjectReview]:
        stmt = (
            select(ProjectReview)
            .where(ProjectReview.milestone_id == milestone_id)
            .options(selectinload(ProjectReview.reviewer))
            .order_by(ProjectReview.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    # --- Project Update Operations ---

    @staticmethod
    async def create_update(db: AsyncSession, update_obj: ProjectUpdate) -> ProjectUpdate:
        db.add(update_obj)
        await db.commit()
        await db.refresh(update_obj)
        return update_obj

    @staticmethod
    async def get_updates_by_project_id(
        db: AsyncSession, project_id: uuid.UUID
    ) -> List[ProjectUpdate]:
        stmt = (
            select(ProjectUpdate)
            .where(
                and_(
                    ProjectUpdate.project_id == project_id,
                    ProjectUpdate.is_deleted.is_(False),
                )
            )
            .options(selectinload(ProjectUpdate.author))
            .order_by(ProjectUpdate.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())
