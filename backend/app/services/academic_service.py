import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.academic import (
    University,
    UniversityAdministrator,
    Department,
    FacultyAffiliation,
    AcademicIntake,
    IntakeTeamAllocation,
)
from app.models.user import User
from app.models.challenge import Challenge
from app.models.team import Team, TeamMember
from app.core.constants import (
    UserRole,
    ChallengeStatus,
    TeamMemberRole,
    TeamMemberStatus,
    UniversityStatus,
    AffiliationStatus,
    IntakeStatus,
    IntakeType,
    TeamAllocationStatus,
    AuditAction,
)
from app.core.exceptions import (
    UniversityNotFoundError,
    DuplicateUniversityError,
    UniversitySuspendedError,
    DepartmentNotFoundError,
    DuplicateDepartmentError,
    InvalidHODAffiliationError,
    FacultyAffiliationNotFoundError,
    DuplicateActiveAffiliationError,
    AcademicIntakeNotFoundError,
    DuplicateChallengeClaimError,
    ChallengeAlreadyAssignedError,
    FacultyMentorCapacityExceededError,
    DuplicateChallengeMentorshipError,
    ActiveAcademicBindingsExistError,
    ConcurrencyConflictError,
    AuthorizationError,
    NotFoundError,
    BadRequestError,
)
from app.repositories.academic_repository import AcademicRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.academic import (
    UniversityCreate,
    UniversityUpdate,
    UniversityStatusUpdate,
    UniversityResponse,
    UniversityListResponse,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentHODUpdate,
    DepartmentResponse,
    DepartmentListResponse,
    FacultyAffiliationCreate,
    FacultyAffiliationVerify,
    FacultyAffiliationResponse,
    FacultyAffiliationListResponse,
    IntakeTeamAllocationCreate,
    IntakeTeamAllocationResponse,
    AcademicIntakeResponse,
    AcademicIntakeListResponse,
)


class AcademicService:
    """Service layer coordinating academic institutional onboarding, governance, and challenge routing."""

    # --- University Management ---

    @staticmethod
    async def register_university(db: AsyncSession, data: UniversityCreate, current_user: User) -> UniversityResponse:
        # 1. Check duplicate name or code
        existing_code = await AcademicRepository.get_university_by_code(db, data.code)
        if existing_code:
            raise DuplicateUniversityError("A university with this code already exists.")

        existing_name = await AcademicRepository.get_university_by_name(db, data.name)
        if existing_name:
            raise DuplicateUniversityError("A university with this legal name already exists.")

        # 2. Instantiate and persist
        university = University(
            name=data.name,
            code=data.code,
            district=data.district,
            state=data.state,
            address=data.address,
            website=data.website,
            contact_email=data.contact_email,
            contact_phone=data.contact_phone,
            status=UniversityStatus.PENDING_VERIFICATION,
            accreditation_details=data.accreditation_details or {},
            domain_expertise=data.domain_expertise or [],
            created_by=current_user.id,
            version=1,
        )
        created = await AcademicRepository.create_university(db, university, current_user.id)

        # 3. Audit Log
        await AuditRepository.log(
            db,
            action=AuditAction.UNIVERSITY_REGISTERED,
            entity_type="university",
            user_id=current_user.id,
            entity_id=created.id,
            metadata={"name": created.name, "code": created.code},
        )
        return UniversityResponse.model_validate(created)

    @staticmethod
    async def get_university(db: AsyncSession, university_id: uuid.UUID) -> UniversityResponse:
        univ = await AcademicRepository.get_university_by_id(db, university_id)
        if not univ:
            raise UniversityNotFoundError()
        return UniversityResponse.model_validate(univ)

    @staticmethod
    async def list_universities(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 50,
        state: Optional[str] = None,
        district: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> UniversityListResponse:
        items, total = await AcademicRepository.list_universities(
            db, skip=skip, limit=limit, state=state, district=district, status=status, search=search
        )
        page = (skip // limit) + 1 if limit > 0 else 1
        return UniversityListResponse(
            items=[UniversityResponse.model_validate(u) for u in items],
            total=total,
            page=page,
            limit=limit,
        )

    @staticmethod
    async def update_university(
        db: AsyncSession, university_id: uuid.UUID, data: UniversityUpdate, current_user: User
    ) -> UniversityResponse:
        univ = await AcademicRepository.get_university_by_id(db, university_id)
        if not univ:
            raise UniversityNotFoundError()

        # Authorization: Platform Admin or University Admin
        is_admin = current_user.role == UserRole.ADMIN
        if not is_admin:
            admin_rec = await AcademicRepository.get_university_admin(db, university_id, current_user.id)
            if not admin_rec:
                raise AuthorizationError("Only authorized university administrators can update university details.")

        # Optimistic concurrency check
        if univ.version != data.version:
            raise ConcurrencyConflictError()

        # Duplicate name check if changing name
        if data.name and data.name.lower() != univ.name.lower():
            existing = await AcademicRepository.get_university_by_name(db, data.name)
            if existing and existing.id != univ.id:
                raise DuplicateUniversityError()

        update_dict = data.model_dump(exclude={"version"}, exclude_unset=True)
        updated = await AcademicRepository.update_university(db, univ, update_dict)

        await AuditRepository.log(
            db,
            action=AuditAction.UNIVERSITY_UPDATED,
            entity_type="university",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"version": updated.version},
        )
        return UniversityResponse.model_validate(updated)

    @staticmethod
    async def update_university_status(
        db: AsyncSession, university_id: uuid.UUID, data: UniversityStatusUpdate, current_user: User
    ) -> UniversityResponse:
        if current_user.role != UserRole.ADMIN:
            raise AuthorizationError("Only Platform Admins can update university verification status.")

        univ = await AcademicRepository.get_university_by_id(db, university_id)
        if not univ:
            raise UniversityNotFoundError()

        if univ.version != data.version:
            raise ConcurrencyConflictError()

        old_status = univ.status
        update_dict = {"status": data.status}
        if data.status == UniversityStatus.VERIFIED:
            update_dict["verified_by"] = current_user.id
            update_dict["verified_at"] = datetime.now(timezone.utc)

        updated = await AcademicRepository.update_university(db, univ, update_dict)

        # Audit emission
        audit_action = AuditAction.UNIVERSITY_UPDATED
        if data.status == UniversityStatus.VERIFIED:
            audit_action = AuditAction.UNIVERSITY_VERIFIED
        elif data.status == UniversityStatus.REJECTED:
            audit_action = AuditAction.UNIVERSITY_REJECTED
        elif data.status == UniversityStatus.SUSPENDED:
            audit_action = AuditAction.UNIVERSITY_SUSPENDED

        await AuditRepository.log(
            db,
            action=audit_action,
            entity_type="university",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"old_status": old_status, "new_status": str(data.status)},
        )
        return UniversityResponse.model_validate(updated)

    @staticmethod
    async def delete_university(db: AsyncSession, university_id: uuid.UUID, current_user: User) -> None:
        if current_user.role != UserRole.ADMIN:
            raise AuthorizationError("Only Platform Admins can delete a university.")

        univ = await AcademicRepository.get_university_by_id(db, university_id)
        if not univ:
            raise UniversityNotFoundError()

        # Institutional Safeguard: Block if active bindings exist
        has_bindings = await AcademicRepository.has_active_academic_bindings(db, university_id)
        if has_bindings:
            raise ActiveAcademicBindingsExistError()

        await AcademicRepository.soft_delete_university(db, univ)
        await AuditRepository.log(
            db,
            action=AuditAction.UNIVERSITY_UPDATED,
            entity_type="university",
            user_id=current_user.id,
            entity_id=univ.id,
            metadata={"deleted": True},
        )

    # --- Department Management ---

    @staticmethod
    async def create_department(
        db: AsyncSession, university_id: uuid.UUID, data: DepartmentCreate, current_user: User
    ) -> DepartmentResponse:
        univ = await AcademicRepository.get_university_by_id(db, university_id)
        if not univ:
            raise UniversityNotFoundError()

        if univ.status == UniversityStatus.SUSPENDED:
            raise UniversitySuspendedError()

        # Check authorization
        if current_user.role != UserRole.ADMIN:
            admin_rec = await AcademicRepository.get_university_admin(db, university_id, current_user.id)
            if not admin_rec:
                raise AuthorizationError("Only university administrators can create departments.")

        # Check duplicate code in same university
        existing_dept = await AcademicRepository.get_department_by_code(db, university_id, data.code)
        if existing_dept:
            raise DuplicateDepartmentError("A department with this code already exists in this university.")

        dept = Department(
            university_id=university_id,
            name=data.name,
            code=data.code,
            head_of_department_id=data.head_of_department_id,
            specializations=data.specializations or [],
            contact_email=data.contact_email,
        )
        created = await AcademicRepository.create_department(db, dept)

        await AuditRepository.log(
            db,
            action=AuditAction.DEPARTMENT_CREATED,
            entity_type="department",
            user_id=current_user.id,
            entity_id=created.id,
            metadata={"university_id": str(university_id), "code": created.code},
        )
        return DepartmentResponse.model_validate(created)

    @staticmethod
    async def list_departments(db: AsyncSession, university_id: uuid.UUID) -> DepartmentListResponse:
        univ = await AcademicRepository.get_university_by_id(db, university_id)
        if not univ:
            raise UniversityNotFoundError()

        depts = await AcademicRepository.list_departments(db, university_id)
        return DepartmentListResponse(
            items=[DepartmentResponse.model_validate(d) for d in depts],
            total=len(depts),
        )

    @staticmethod
    async def update_department_hod(
        db: AsyncSession, department_id: uuid.UUID, data: DepartmentHODUpdate, current_user: User
    ) -> DepartmentResponse:
        dept = await AcademicRepository.get_department_by_id(db, department_id)
        if not dept:
            raise DepartmentNotFoundError()

        # Authorize
        if current_user.role != UserRole.ADMIN:
            admin_rec = await AcademicRepository.get_university_admin(db, dept.university_id, current_user.id)
            if not admin_rec:
                raise AuthorizationError("Only university administrators can assign Heads of Department.")

        # Validate HOD affiliation constraint
        if data.head_of_department_id:
            aff = await AcademicRepository.get_active_faculty_affiliation(db, data.head_of_department_id)
            if not aff or aff.university_id != dept.university_id or aff.department_id != dept.id:
                raise InvalidHODAffiliationError()

        updated = await AcademicRepository.update_department(
            db, dept, {"head_of_department_id": data.head_of_department_id}
        )
        await AuditRepository.log(
            db,
            action=AuditAction.HOD_ASSIGNED,
            entity_type="department",
            user_id=current_user.id,
            entity_id=dept.id,
            metadata={"hod_user_id": str(data.head_of_department_id)},
        )
        return DepartmentResponse.model_validate(updated)

    # --- Faculty Affiliation Lifecycle ---

    @staticmethod
    async def request_faculty_affiliation(
        db: AsyncSession, data: FacultyAffiliationCreate, current_user: User
    ) -> FacultyAffiliationResponse:
        if current_user.role != UserRole.FACULTY and current_user.role != UserRole.ADMIN:
            raise AuthorizationError("Only faculty members can request institutional department affiliations.")

        # Check existing active affiliation
        active_aff = await AcademicRepository.get_active_faculty_affiliation(db, current_user.id)
        if active_aff:
            raise DuplicateActiveAffiliationError("Faculty member already has an active primary affiliation.")

        # Verify department & university exist
        dept = await AcademicRepository.get_department_by_id(db, data.department_id)
        if not dept or dept.university_id != data.university_id:
            raise DepartmentNotFoundError("Department not found in specified university.")

        # Check existing pending
        existing_aff = await AcademicRepository.get_faculty_affiliation_by_dept(
            db, current_user.id, data.department_id
        )
        if existing_aff and existing_aff.status == AffiliationStatus.PENDING:
            return FacultyAffiliationResponse.model_validate(existing_aff)

        aff = FacultyAffiliation(
            faculty_id=current_user.id,
            university_id=data.university_id,
            department_id=data.department_id,
            designation=data.designation,
            status=AffiliationStatus.PENDING,
        )
        created = await AcademicRepository.create_faculty_affiliation(db, aff)

        await AuditRepository.log(
            db,
            action=AuditAction.FACULTY_AFFILIATION_REQUESTED,
            entity_type="faculty_affiliation",
            user_id=current_user.id,
            entity_id=created.id,
            metadata={"university_id": str(data.university_id), "department_id": str(data.department_id)},
        )
        return FacultyAffiliationResponse.model_validate(created)

    @staticmethod
    async def list_pending_affiliations(
        db: AsyncSession, university_id: uuid.UUID, current_user: User
    ) -> FacultyAffiliationListResponse:
        if current_user.role != UserRole.ADMIN:
            admin_rec = await AcademicRepository.get_university_admin(db, university_id, current_user.id)
            if not admin_rec:
                raise AuthorizationError()

        pending = await AcademicRepository.list_pending_affiliations(db, university_id)
        return FacultyAffiliationListResponse(
            items=[FacultyAffiliationResponse.model_validate(p) for p in pending],
            total=len(pending),
        )

    @staticmethod
    async def verify_faculty_affiliation(
        db: AsyncSession, affiliation_id: uuid.UUID, data: FacultyAffiliationVerify, current_user: User
    ) -> FacultyAffiliationResponse:
        aff = await AcademicRepository.get_faculty_affiliation_by_id(db, affiliation_id)
        if not aff:
            raise FacultyAffiliationNotFoundError()

        # Authorize: Must be admin of affiliation's university
        if current_user.role != UserRole.ADMIN:
            admin_rec = await AcademicRepository.get_university_admin(db, aff.university_id, current_user.id)
            if not admin_rec:
                raise AuthorizationError()

        new_status = AffiliationStatus.ACTIVE if data.action == "APPROVE" else AffiliationStatus.REJECTED

        if new_status == AffiliationStatus.ACTIVE:
            # Check active affiliation duplicate guard
            active_existing = await AcademicRepository.get_active_faculty_affiliation(db, aff.faculty_id)
            if active_existing and active_existing.id != aff.id:
                raise DuplicateActiveAffiliationError("Faculty member already has another active affiliation.")

        updated = await AcademicRepository.update_affiliation(
            db,
            aff,
            {
                "status": new_status,
                "verified_by": current_user.id,
                "verified_at": datetime.now(timezone.utc),
            },
        )

        audit_action = (
            AuditAction.FACULTY_AFFILIATION_APPROVED
            if new_status == AffiliationStatus.ACTIVE
            else AuditAction.FACULTY_AFFILIATION_REJECTED
        )
        await AuditRepository.log(
            db,
            action=audit_action,
            entity_type="faculty_affiliation",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"status": str(new_status)},
        )
        return FacultyAffiliationResponse.model_validate(updated)

    # --- Academic Challenge Intake & Team Allocation ---

    @staticmethod
    async def claim_challenge(
        db: AsyncSession, challenge_id: uuid.UUID, university_id: uuid.UUID, current_user: User
    ) -> AcademicIntakeResponse:
        # Check university exists and is verified
        univ = await AcademicRepository.get_university_by_id(db, university_id)
        if not univ:
            raise UniversityNotFoundError()
        if univ.status != UniversityStatus.VERIFIED:
            raise UniversitySuspendedError("Only verified universities can claim societal challenges.")

        # Check authorization (Univ Admin or Faculty affiliated with univ)
        if current_user.role != UserRole.ADMIN:
            admin_rec = await AcademicRepository.get_university_admin(db, university_id, current_user.id)
            aff_rec = await AcademicRepository.get_active_faculty_affiliation(db, current_user.id)
            if not admin_rec and (not aff_rec or aff_rec.university_id != university_id):
                raise AuthorizationError("Must be an affiliated faculty or administrator of this university.")

        # Check challenge is published
        stmt = select(Challenge).where(and_(Challenge.id == challenge_id, Challenge.is_deleted.is_(False)))
        res = await db.execute(stmt)
        challenge = res.scalar_one_or_none()
        if not challenge:
            raise NotFoundError("Challenge not found")
        if challenge.status != ChallengeStatus.PUBLISHED:
            raise ChallengeAlreadyAssignedError("Challenge is not currently open for academic intake.")

        # Check duplicate claim by same university
        existing_claim = await AcademicRepository.get_intake_by_univ_and_challenge(db, university_id, challenge_id)
        if existing_claim:
            raise DuplicateChallengeClaimError()

        intake = AcademicIntake(
            challenge_id=challenge_id,
            university_id=university_id,
            status=IntakeStatus.ACCEPTED,
            intake_type=IntakeType.DIRECT_CLAIM,
            claimed_by=current_user.id,
            claimed_at=datetime.now(timezone.utc),
            version=1,
        )
        created = await AcademicRepository.create_intake(db, intake)

        await AuditRepository.log(
            db,
            action=AuditAction.CHALLENGE_CLAIMED_BY_UNIVERSITY,
            entity_type="academic_intake",
            user_id=current_user.id,
            entity_id=created.id,
            metadata={"university_id": str(university_id), "challenge_id": str(challenge_id)},
        )
        return AcademicIntakeResponse.model_validate(created)

    @staticmethod
    async def allocate_team_to_intake(
        db: AsyncSession, intake_id: uuid.UUID, data: IntakeTeamAllocationCreate, current_user: User
    ) -> IntakeTeamAllocationResponse:
        intake = await AcademicRepository.get_intake_by_id(db, intake_id)
        if not intake:
            raise AcademicIntakeNotFoundError()

        # Check user authorization
        if current_user.role != UserRole.ADMIN:
            admin_rec = await AcademicRepository.get_university_admin(db, intake.university_id, current_user.id)
            if not admin_rec:
                raise AuthorizationError("Only university administrators can allocate teams and mentors.")

        # Check team exists and belongs to the intake's challenge
        team_stmt = select(Team).where(and_(Team.id == data.team_id, Team.is_deleted.is_(False)))
        team_res = await db.execute(team_stmt)
        team = team_res.scalar_one_or_none()
        if not team:
            raise NotFoundError("Team not found")
        if team.challenge_id != intake.challenge_id:
            raise BadRequestError("Team is not registered for this intake's challenge.")

        # Check faculty mentor capacity rules
        # Rule 1: Max 3 active mentorships platform-wide
        mentor_count = await AcademicRepository.count_active_faculty_mentorships(db, data.faculty_mentor_id)
        if mentor_count >= 3:
            raise FacultyMentorCapacityExceededError()

        # Rule 2: Max 1 team mentorship per specific challenge
        has_challenge_mentor = await AcademicRepository.has_active_challenge_mentorship(
            db, data.faculty_mentor_id, intake.challenge_id
        )
        if has_challenge_mentor:
            raise DuplicateChallengeMentorshipError()

        # Rule 3: Add/Bind mentor to M3 Team if not already member
        # Check M3 team active mentor capacity (max 2)
        active_team_mentors = [
            m for m in team.members if m.role == TeamMemberRole.MENTOR and m.status == TeamMemberStatus.ACTIVE and not m.is_deleted
        ]
        if len(active_team_mentors) >= 2:
            raise BadRequestError("Team has reached its maximum mentor capacity (max 2 mentors).")

        # Create intake team allocation
        alloc = IntakeTeamAllocation(
            intake_id=intake.id,
            team_id=team.id,
            department_id=data.department_id,
            faculty_mentor_id=data.faculty_mentor_id,
            status=TeamAllocationStatus.ALLOCATED,
            allocated_by=current_user.id,
            allocated_at=datetime.now(timezone.utc),
        )
        created_alloc = await AcademicRepository.create_team_allocation(db, alloc)

        # Update intake status to ASSIGNED if previously ACCEPTED
        if intake.status == IntakeStatus.ACCEPTED:
            await AcademicRepository.update_intake(db, intake, {"status": IntakeStatus.ASSIGNED})

        # Add mentor to M3 team members table
        team_member = TeamMember(
            team_id=team.id,
            user_id=data.faculty_mentor_id,
            role=TeamMemberRole.MENTOR,
            status=TeamMemberStatus.ACTIVE,
            invited_by=current_user.id,
            joined_at=datetime.now(timezone.utc),
        )
        db.add(team_member)
        await db.commit()

        # Emitting audit logs
        await AuditRepository.log(
            db,
            action=AuditAction.TEAM_ALLOCATED_TO_CHALLENGE,
            entity_type="intake_team_allocation",
            user_id=current_user.id,
            entity_id=created_alloc.id,
            metadata={"team_id": str(team.id), "intake_id": str(intake.id)},
        )
        await AuditRepository.log(
            db,
            action=AuditAction.FACULTY_MENTOR_ASSIGNED_TO_TEAM,
            entity_type="team",
            user_id=current_user.id,
            entity_id=team.id,
            metadata={"faculty_id": str(data.faculty_mentor_id)},
        )

        return IntakeTeamAllocationResponse.model_validate(created_alloc)
