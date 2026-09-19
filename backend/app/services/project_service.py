import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.project import (
    InnovationProject,
    ProjectMilestone,
    ProjectDeliverable,
    ProjectReview,
    ProjectUpdate,
)
from app.models.academic import IntakeTeamAllocation, AcademicIntake
from app.models.team import Team, TeamMember
from app.models.user import User
from app.core.constants import (
    UserRole,
    TeamMemberRole,
    TeamMemberStatus,
    ProjectStatus,
    ProjectStage,
    ProjectOutcome,
    MilestoneStatus,
    DeliverableType,
    ReviewDecision,
    UpdateType,
    AuditAction,
)
from app.core.exceptions import (
    ProjectNotFoundError,
    DuplicateProjectAllocationError,
    InvalidAllocationBindingError,
    InvalidMilestoneWeightSumError,
    MilestoneNotFoundError,
    DuplicateMilestoneSequenceError,
    PreviousMilestonesIncompleteError,
    ApprovedMilestoneImmutableError,
    DeliverableNotFoundError,
    DeliverableLockedForReviewError,
    DuplicateAssetDetectedError,
    UnauthorizedReviewerError,
    ProjectNotReadyForCompletionError,
    OptimisticLockError,
    AuthorizationError,
    BadRequestError,
    InvalidStateTransitionError,
)
from app.repositories.project_repository import ProjectRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.project import (
    InnovationProjectCreate,
    InnovationProjectUpdate,
    ProjectActivateRequest,
    ProjectStageTransitionRequest,
    ProjectCompletionRequest,
    ProjectSuspendRequest,
    ProjectMilestoneCreate,
    ProjectMilestoneUpdate,
    ProjectDeliverableCreate,
    ProjectReviewCreate,
    ProjectUpdateCreate,
)


class ProjectService:
    """Business service layer for Module 5: Innovation Project Lifecycle."""

    # --- Project Lifecycle Methods ---

    @staticmethod
    async def create_project(
        db: AsyncSession,
        payload: InnovationProjectCreate,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> InnovationProject:
        # 1. Fetch and validate M4 IntakeTeamAllocation
        stmt = (
            select(IntakeTeamAllocation)
            .where(
                and_(
                    IntakeTeamAllocation.id == payload.intake_team_allocation_id,
                    IntakeTeamAllocation.is_deleted.is_(False),
                )
            )
        )
        result = await db.execute(stmt)
        allocation = result.scalar_one_or_none()
        if not allocation:
            raise InvalidAllocationBindingError("Intake team allocation not found or inactive.")

        # 2. Check if a project already exists for this allocation
        existing = await ProjectRepository.get_project_by_allocation_id(db, allocation.id)
        if existing:
            raise DuplicateProjectAllocationError()

        # 3. Check authorization: Must be Team Leader or Admin
        if current_user.role not in [UserRole.ADMIN, UserRole.ADMIN.value, "admin"]:
            team_member_stmt = select(TeamMember).where(
                and_(
                    TeamMember.team_id == allocation.team_id,
                    TeamMember.user_id == current_user.id,
                    TeamMember.role.in_([TeamMemberRole.LEADER, TeamMemberRole.CO_LEADER, "LEADER", "CO_LEADER"]),
                    TeamMember.status.in_([TeamMemberStatus.ACTIVE, "ACTIVE"]),
                    TeamMember.is_deleted.is_(False),
                )
            )
            member_res = await db.execute(team_member_stmt)
            leader_member = member_res.scalar_one_or_none()
            if not leader_member:
                raise AuthorizationError("Only the team leader may initialize an innovation project.")

        # 4. Fetch parent intake to get challenge_id & university_id
        intake_stmt = select(AcademicIntake).where(
            and_(AcademicIntake.id == allocation.intake_id, AcademicIntake.is_deleted.is_(False))
        )
        intake_res = await db.execute(intake_stmt)
        intake = intake_res.scalar_one_or_none()
        if not intake:
            raise InvalidAllocationBindingError("Parent academic intake not found.")

        # 5. Instantiate InnovationProject
        project = InnovationProject(
            intake_team_allocation_id=allocation.id,
            challenge_id=intake.challenge_id,
            team_id=allocation.team_id,
            university_id=intake.university_id,
            department_id=allocation.department_id,
            primary_faculty_mentor_id=allocation.faculty_mentor_id,
            secondary_mentor_id=payload.secondary_mentor_id,
            title=payload.title,
            abstract=payload.abstract,
            status=ProjectStatus.PROPOSAL,
            current_stage=ProjectStage.CONCEPT_RESEARCH,
            progress_percentage=0,
            repository_url=payload.repository_url,
            demo_url=payload.demo_url,
            tech_stack=payload.tech_stack or [],
            target_completion_date=payload.target_completion_date,
            created_by=current_user.id,
            version=1,
            is_deleted=False,
        )

        saved_project = await ProjectRepository.create_project(db, project)

        # 6. Audit log
        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PROJECT_CREATED,
            entity_type="project",
            user_id=current_user.id,
            entity_id=saved_project.id,
            metadata={
                "title": saved_project.title,
                "team_id": str(saved_project.team_id),
                "allocation_id": str(saved_project.intake_team_allocation_id),
                "mentor_id": str(saved_project.primary_faculty_mentor_id),
            },
        )

        return saved_project

    @staticmethod
    async def get_project(db: AsyncSession, project_id: uuid.UUID) -> InnovationProject:
        project = await ProjectRepository.get_project_by_id(db, project_id)
        if not project:
            raise ProjectNotFoundError()
        return project

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
        return await ProjectRepository.list_projects(
            db=db,
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

    @staticmethod
    async def update_project_metadata(
        db: AsyncSession,
        project_id: uuid.UUID,
        payload: InnovationProjectUpdate,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> InnovationProject:
        project = await ProjectService.get_project(db, project_id)

        # Authorization guard
        is_admin = current_user.role in [UserRole.ADMIN, UserRole.ADMIN.value, "admin"]
        is_mentor = current_user.id == project.primary_faculty_mentor_id or current_user.id == project.secondary_mentor_id
        is_creator = current_user.id == project.created_by

        if not (is_admin or is_mentor or is_creator):
            raise AuthorizationError("Not authorized to update project metadata.")

        update_dict = payload.model_dump(exclude_unset=True)
        expected_version = update_dict.pop("version", None)

        try:
            updated = await ProjectRepository.update_project(
                db, project, update_dict, expected_version=expected_version
            )
        except ValueError as e:
            if str(e) == "OPTIMISTIC_LOCK_ERROR":
                raise OptimisticLockError()
            raise

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PROJECT_METADATA_UPDATED,
            entity_type="project",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata=update_dict,
        )

        return updated

    @staticmethod
    async def activate_project(
        db: AsyncSession,
        project_id: uuid.UUID,
        payload: ProjectActivateRequest,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> InnovationProject:
        project = await ProjectService.get_project(db, project_id)

        # Guard: Only Primary Mentor or Admin can activate
        is_admin = current_user.role in [UserRole.ADMIN, UserRole.ADMIN.value, "admin"]
        is_mentor = current_user.id == project.primary_faculty_mentor_id
        if not (is_admin or is_mentor):
            raise AuthorizationError("Only the primary faculty mentor or admin can activate the project roadmap.")

        if project.status != ProjectStatus.PROPOSAL:
            raise InvalidStateTransitionError(f"Cannot activate project in {project.status} state.")

        # Validate milestones
        milestones = await ProjectRepository.get_milestones_by_project_id(db, project_id)
        if len(milestones) < 3 or len(milestones) > 10:
            raise BadRequestError("A project must have between 3 and 10 milestones defined before activation.")

        total_weight = sum(m.weight for m in milestones)
        if total_weight != 100:
            raise InvalidMilestoneWeightSumError(
                f"Milestone weights must sum to exactly 100. Current sum is {total_weight}."
            )

        # Transition milestones from DRAFT to IN_PROGRESS
        for m in milestones:
            if m.status in [MilestoneStatus.DRAFT, "DRAFT"]:
                await ProjectRepository.update_milestone(db, m, {"status": MilestoneStatus.IN_PROGRESS})

        try:
            updated = await ProjectRepository.update_project(
                db,
                project,
                {"status": ProjectStatus.ACTIVE},
                expected_version=payload.version,
            )
        except ValueError as e:
            if str(e) == "OPTIMISTIC_LOCK_ERROR":
                raise OptimisticLockError()
            raise

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PROJECT_ROADMAP_ACTIVATED,
            entity_type="project",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"milestones_count": len(milestones), "status": ProjectStatus.ACTIVE},
        )

        return updated

    @staticmethod
    async def transition_stage(
        db: AsyncSession,
        project_id: uuid.UUID,
        payload: ProjectStageTransitionRequest,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> InnovationProject:
        project = await ProjectService.get_project(db, project_id)

        is_admin = current_user.role in [UserRole.ADMIN, UserRole.ADMIN.value, "admin"]
        is_mentor = current_user.id == project.primary_faculty_mentor_id
        if not (is_admin or is_mentor):
            raise AuthorizationError("Only the primary mentor or admin can transition project stages.")

        old_stage = project.current_stage

        try:
            updated = await ProjectRepository.update_project(
                db,
                project,
                {"current_stage": payload.new_stage},
                expected_version=payload.version,
            )
        except ValueError as e:
            if str(e) == "OPTIMISTIC_LOCK_ERROR":
                raise OptimisticLockError()
            raise

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PROJECT_STAGE_CHANGED,
            entity_type="project",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"old_stage": old_stage, "new_stage": str(payload.new_stage), "reason": payload.reason},
        )

        return updated

    @staticmethod
    async def complete_project(
        db: AsyncSession,
        project_id: uuid.UUID,
        payload: ProjectCompletionRequest,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> InnovationProject:
        project = await ProjectService.get_project(db, project_id)

        is_admin = current_user.role in [UserRole.ADMIN, UserRole.ADMIN.value, "admin"]
        is_mentor = current_user.id == project.primary_faculty_mentor_id
        if not (is_admin or is_mentor):
            raise AuthorizationError("Only the primary faculty mentor or admin can sign off on project completion.")

        # Check progress percentage and mandatory milestones
        milestones = await ProjectRepository.get_milestones_by_project_id(db, project_id)
        mandatory_unapproved = [
            m for m in milestones if m.is_mandatory and m.status not in [MilestoneStatus.APPROVED, "APPROVED"]
        ]

        if mandatory_unapproved or project.progress_percentage < 100:
            raise ProjectNotReadyForCompletionError(
                "All mandatory milestones must be approved (100% progress) before project completion."
            )

        now = datetime.now(timezone.utc)
        try:
            updated = await ProjectRepository.update_project(
                db,
                project,
                {
                    "status": ProjectStatus.COMPLETED,
                    "project_outcome": payload.outcome,
                    "actual_completion_date": now,
                    "closure_reason": payload.feedback,
                },
                expected_version=payload.version,
            )
        except ValueError as e:
            if str(e) == "OPTIMISTIC_LOCK_ERROR":
                raise OptimisticLockError()
            raise

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PROJECT_COMPLETED,
            entity_type="project",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={
                "outcome": str(payload.outcome),
                "score": payload.score,
                "feedback": payload.feedback,
            },
        )

        return updated

    @staticmethod
    async def suspend_project(
        db: AsyncSession,
        project_id: uuid.UUID,
        payload: ProjectSuspendRequest,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> InnovationProject:
        project = await ProjectService.get_project(db, project_id)

        is_admin = current_user.role in [UserRole.ADMIN, UserRole.ADMIN.value, "admin"]
        if not is_admin:
            raise AuthorizationError("Only administrators can place an innovation project on administrative hold.")

        try:
            updated = await ProjectRepository.update_project(
                db,
                project,
                {
                    "status": ProjectStatus.SUSPENDED,
                    "closure_reason": payload.reason,
                },
                expected_version=payload.version,
            )
        except ValueError as e:
            if str(e) == "OPTIMISTIC_LOCK_ERROR":
                raise OptimisticLockError()
            raise

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PROJECT_SUSPENDED,
            entity_type="project",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"reason": payload.reason},
        )

        return updated

    @staticmethod
    async def resume_project(
        db: AsyncSession,
        project_id: uuid.UUID,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> InnovationProject:
        project = await ProjectService.get_project(db, project_id)

        is_admin = current_user.role in [UserRole.ADMIN, UserRole.ADMIN.value, "admin"]
        if not is_admin:
            raise AuthorizationError("Only administrators can resume a suspended project.")

        if project.status not in [ProjectStatus.SUSPENDED, "SUSPENDED"]:
            raise InvalidStateTransitionError("Only suspended projects can be resumed.")

        updated = await ProjectRepository.update_project(
            db,
            project,
            {"status": ProjectStatus.ACTIVE, "closure_reason": None},
        )

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PROJECT_RESUMED,
            entity_type="project",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"status": ProjectStatus.ACTIVE},
        )

        return updated

    # --- Milestone Methods ---

    @staticmethod
    async def create_milestone(
        db: AsyncSession,
        project_id: uuid.UUID,
        payload: ProjectMilestoneCreate,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> ProjectMilestone:
        project = await ProjectService.get_project(db, project_id)

        is_admin = current_user.role in [UserRole.ADMIN, UserRole.ADMIN.value, "admin"]
        is_mentor = current_user.id == project.primary_faculty_mentor_id
        is_creator = current_user.id == project.created_by
        if not (is_admin or is_mentor or is_creator):
            raise AuthorizationError("Not authorized to add milestones to this project.")

        # Check duplicate sequence index
        existing_seq = await ProjectRepository.get_milestone_by_sequence(
            db, project_id, payload.sequence_index
        )
        if existing_seq:
            raise DuplicateMilestoneSequenceError(
                f"Milestone with sequence index {payload.sequence_index} already exists."
            )

        milestone = ProjectMilestone(
            project_id=project_id,
            sequence_index=payload.sequence_index,
            title=payload.title,
            description=payload.description,
            weight=payload.weight,
            status=MilestoneStatus.DRAFT if project.status == ProjectStatus.PROPOSAL else MilestoneStatus.IN_PROGRESS,
            is_mandatory=payload.is_mandatory,
            due_date=payload.due_date,
            acceptance_criteria=payload.acceptance_criteria or [],
            created_by=current_user.id,
            version=1,
            is_deleted=False,
        )

        saved = await ProjectRepository.create_milestone(db, milestone)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.MILESTONE_CREATED,
            entity_type="milestone",
            user_id=current_user.id,
            entity_id=saved.id,
            metadata={
                "project_id": str(project_id),
                "sequence_index": saved.sequence_index,
                "weight": saved.weight,
                "title": saved.title,
            },
        )

        return saved

    @staticmethod
    async def get_milestones(db: AsyncSession, project_id: uuid.UUID) -> List[ProjectMilestone]:
        await ProjectService.get_project(db, project_id)
        return await ProjectRepository.get_milestones_by_project_id(db, project_id)

    @staticmethod
    async def update_milestone(
        db: AsyncSession,
        milestone_id: uuid.UUID,
        payload: ProjectMilestoneUpdate,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> ProjectMilestone:
        milestone = await ProjectRepository.get_milestone_by_id(db, milestone_id)
        if not milestone:
            raise MilestoneNotFoundError()

        if milestone.status in [MilestoneStatus.APPROVED, "APPROVED"]:
            raise ApprovedMilestoneImmutableError()

        update_dict = payload.model_dump(exclude_unset=True)

        try:
            updated = await ProjectRepository.update_milestone(db, milestone, update_dict)
        except ValueError as e:
            if str(e) == "OPTIMISTIC_LOCK_ERROR":
                raise OptimisticLockError()
            raise

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.MILESTONE_UPDATED,
            entity_type="milestone",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata=update_dict,
        )

        return updated

    @staticmethod
    async def submit_milestone(
        db: AsyncSession,
        project_id: uuid.UUID,
        milestone_id: uuid.UUID,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> ProjectMilestone:
        project = await ProjectService.get_project(db, project_id)
        milestone = await ProjectRepository.get_milestone_by_id(db, milestone_id)
        if not milestone or milestone.project_id != project_id:
            raise MilestoneNotFoundError()

        # Enforce sequential order: all milestones with sequence_index < current must be APPROVED
        all_milestones = await ProjectRepository.get_milestones_by_project_id(db, project_id)
        for prev in all_milestones:
            if prev.sequence_index < milestone.sequence_index and prev.status not in [MilestoneStatus.APPROVED, "APPROVED"]:
                raise PreviousMilestonesIncompleteError(
                    f"Milestone {prev.sequence_index} must be approved before submitting milestone {milestone.sequence_index}."
                )

        updated = await ProjectRepository.update_milestone(
            db, milestone, {"status": MilestoneStatus.SUBMITTED}
        )

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.MILESTONE_SUBMITTED,
            entity_type="milestone",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"sequence_index": updated.sequence_index, "status": MilestoneStatus.SUBMITTED},
        )

        return updated

    # --- Deliverables Methods ---

    @staticmethod
    async def create_deliverable(
        db: AsyncSession,
        project_id: uuid.UUID,
        payload: ProjectDeliverableCreate,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> ProjectDeliverable:
        project = await ProjectService.get_project(db, project_id)
        milestone = await ProjectRepository.get_milestone_by_id(db, payload.milestone_id)
        if not milestone or milestone.project_id != project_id:
            raise MilestoneNotFoundError()

        # Lock deliverable modifications while submitted / under review
        if milestone.status in [MilestoneStatus.SUBMITTED, MilestoneStatus.UNDER_REVIEW, "SUBMITTED", "UNDER_REVIEW"]:
            raise DeliverableLockedForReviewError(
                "Milestone is currently under review. Uploading deliverables is locked until review completes."
            )

        # Check duplicate asset checksum for the same milestone
        if payload.sha256_hash:
            existing_deliverables = await ProjectRepository.get_deliverables_by_milestone_id(
                db, milestone.id
            )
            for d in existing_deliverables:
                if d.sha256_hash == payload.sha256_hash:
                    raise DuplicateAssetDetectedError()

        # Version chaining
        version_number = 1
        if payload.parent_deliverable_id:
            parent = await ProjectRepository.get_deliverable_by_id(db, payload.parent_deliverable_id)
            if parent:
                version_number = parent.version_number + 1

        deliverable = ProjectDeliverable(
            milestone_id=payload.milestone_id,
            project_id=project_id,
            uploader_id=current_user.id,
            deliverable_type=payload.deliverable_type,
            title=payload.title,
            asset_url=payload.asset_url,
            file_name=payload.file_name,
            mime_type=payload.mime_type,
            file_size_bytes=payload.file_size_bytes,
            sha256_hash=payload.sha256_hash,
            version_number=version_number,
            parent_deliverable_id=payload.parent_deliverable_id,
            metadata_info=payload.metadata_info or {},
            is_deleted=False,
        )

        saved = await ProjectRepository.create_deliverable(db, deliverable)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.DELIVERABLE_UPLOADED,
            entity_type="deliverable",
            user_id=current_user.id,
            entity_id=saved.id,
            metadata={
                "project_id": str(project_id),
                "milestone_id": str(payload.milestone_id),
                "version_number": saved.version_number,
                "type": str(saved.deliverable_type),
            },
        )

        return saved

    # --- Review Workflow Methods ---

    @staticmethod
    async def review_milestone(
        db: AsyncSession,
        project_id: uuid.UUID,
        milestone_id: uuid.UUID,
        payload: ProjectReviewCreate,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> ProjectReview:
        project = await ProjectService.get_project(db, project_id)
        milestone = await ProjectRepository.get_milestone_by_id(db, milestone_id)
        if not milestone or milestone.project_id != project_id:
            raise MilestoneNotFoundError()

        # Authorization: Must be Primary Faculty Mentor or Admin
        is_admin = current_user.role in [UserRole.ADMIN, UserRole.ADMIN.value, "admin"]
        is_mentor = current_user.id == project.primary_faculty_mentor_id
        if not (is_admin or is_mentor):
            raise UnauthorizedReviewerError("Only the assigned primary faculty mentor or admin may review milestones.")

        # Create immutable review record
        review = ProjectReview(
            milestone_id=milestone_id,
            project_id=project_id,
            reviewer_id=current_user.id,
            decision=payload.decision,
            score=payload.score,
            rubric_breakdown=payload.rubric_breakdown or {},
            feedback=payload.feedback,
            is_final_signoff=payload.is_final_signoff,
            created_at=datetime.now(timezone.utc),
        )
        saved_review = await ProjectRepository.create_review(db, review)

        # Apply state changes to milestone & project
        if payload.decision in [ReviewDecision.APPROVED, "APPROVED"]:
            now = datetime.now(timezone.utc)
            await ProjectRepository.update_milestone(
                db, milestone, {"status": MilestoneStatus.APPROVED, "completed_at": now}
            )

            # Recalculate project progress
            all_milestones = await ProjectRepository.get_milestones_by_project_id(db, project_id)
            approved_weights = sum(
                m.weight for m in all_milestones if m.status in [MilestoneStatus.APPROVED, "APPROVED"]
            )
            project_updates = {"progress_percentage": approved_weights}

            # If all mandatory milestones approved, transition to REVIEW_READY
            mandatory_unapproved = [
                m for m in all_milestones if m.is_mandatory and m.status not in [MilestoneStatus.APPROVED, "APPROVED"]
            ]
            if not mandatory_unapproved and approved_weights >= 100:
                project_updates["status"] = ProjectStatus.REVIEW_READY

            await ProjectRepository.update_project(db, project, project_updates)

            await AuditRepository.create_log(
                session=db,
                action=AuditAction.MILESTONE_APPROVED,
                entity_type="milestone",
                user_id=current_user.id,
                entity_id=milestone_id,
                metadata={"weight": milestone.weight, "new_progress": approved_weights},
            )

        elif payload.decision in [ReviewDecision.CHANGES_REQUESTED, "CHANGES_REQUESTED"]:
            await ProjectRepository.update_milestone(
                db, milestone, {"status": MilestoneStatus.CHANGES_REQUESTED}
            )
        elif payload.decision in [ReviewDecision.REJECTED, "REJECTED"]:
            await ProjectRepository.update_milestone(
                db, milestone, {"status": MilestoneStatus.REJECTED}
            )

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.MILESTONE_REVIEW_COMPLETED,
            entity_type="review",
            user_id=current_user.id,
            entity_id=saved_review.id,
            metadata={
                "decision": str(payload.decision),
                "score": payload.score,
                "milestone_id": str(milestone_id),
            },
        )

        return saved_review

    # --- Project Updates Methods ---

    @staticmethod
    async def create_update(
        db: AsyncSession,
        project_id: uuid.UUID,
        payload: ProjectUpdateCreate,
        current_user: User,
        ip_address: Optional[str] = None,
    ) -> ProjectUpdate:
        project = await ProjectService.get_project(db, project_id)

        update_obj = ProjectUpdate(
            project_id=project_id,
            author_id=current_user.id,
            update_type=payload.update_type,
            title=payload.title,
            content=payload.content,
            attachments=payload.attachments or [],
            is_deleted=False,
        )
        saved = await ProjectRepository.create_update(db, update_obj)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PROJECT_UPDATE_POSTED,
            entity_type="project_update",
            user_id=current_user.id,
            entity_id=saved.id,
            metadata={"update_type": str(saved.update_type), "title": saved.title},
        )

        return saved

    @staticmethod
    async def get_updates(db: AsyncSession, project_id: uuid.UUID) -> List[ProjectUpdate]:
        await ProjectService.get_project(db, project_id)
        return await ProjectRepository.get_updates_by_project_id(db, project_id)
