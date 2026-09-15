import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.academic import (
    University,
    UniversityAdministrator,
    Department,
    FacultyAffiliation,
    AcademicIntake,
    IntakeTeamAllocation,
)
from app.models.user import User
from app.core.constants import UniversityStatus, AffiliationStatus, IntakeStatus, TeamAllocationStatus


class AcademicRepository:
    """Repository handling database operations for the Academic Collaboration Hub."""

    # --- University Operations ---

    @staticmethod
    async def create_university(db: AsyncSession, university: University, admin_user_id: uuid.UUID) -> University:
        db.add(university)
        await db.flush()

        # Add creator as primary administrator
        admin = UniversityAdministrator(
            university_id=university.id,
            user_id=admin_user_id,
            is_primary=True,
            is_deleted=False,
        )
        db.add(admin)
        await db.commit()
        await db.refresh(university)
        return university

    @staticmethod
    async def get_university_by_id(db: AsyncSession, university_id: uuid.UUID) -> Optional[University]:
        stmt = (
            select(University)
            .where(and_(University.id == university_id, University.is_deleted.is_(False)))
            .options(
                selectinload(University.departments),
                selectinload(University.administrators),
                selectinload(University.intakes),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_university_by_code(db: AsyncSession, code: str) -> Optional[University]:
        stmt = select(University).where(
            and_(func.upper(University.code) == code.upper().strip(), University.is_deleted.is_(False))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_university_by_name(db: AsyncSession, name: str) -> Optional[University]:
        stmt = select(University).where(
            and_(func.lower(University.name) == name.lower().strip(), University.is_deleted.is_(False))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_universities(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 50,
        state: Optional[str] = None,
        district: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[University], int]:
        filters = [University.is_deleted.is_(False)]

        if state:
            filters.append(func.lower(University.state) == state.lower().strip())
        if district:
            filters.append(func.lower(University.district) == district.lower().strip())
        if status:
            filters.append(University.status == status)
        if search:
            pattern = f"%{search.lower().strip()}%"
            filters.append(
                or_(
                    func.lower(University.name).like(pattern),
                    func.lower(University.code).like(pattern),
                    func.lower(University.district).like(pattern),
                )
            )

        # Count total
        count_stmt = select(func.count(University.id)).where(and_(*filters))
        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()

        # Fetch records
        stmt = (
            select(University)
            .where(and_(*filters))
            .options(selectinload(University.departments))
            .order_by(University.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all()), total

    @staticmethod
    async def update_university(db: AsyncSession, university: University, update_data: Dict[str, Any]) -> University:
        for key, value in update_data.items():
            if hasattr(university, key) and value is not None:
                setattr(university, key, value)
        university.version += 1
        university.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(university)
        return university

    @staticmethod
    async def soft_delete_university(db: AsyncSession, university: University) -> University:
        university.is_deleted = True
        university.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(university)
        return university

    # --- University Administrator Operations ---

    @staticmethod
    async def get_university_admin(db: AsyncSession, university_id: uuid.UUID, user_id: uuid.UUID) -> Optional[UniversityAdministrator]:
        stmt = select(UniversityAdministrator).where(
            and_(
                UniversityAdministrator.university_id == university_id,
                UniversityAdministrator.user_id == user_id,
                UniversityAdministrator.is_deleted.is_(False),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def add_university_admin(db: AsyncSession, university_id: uuid.UUID, user_id: uuid.UUID, is_primary: bool = False) -> UniversityAdministrator:
        admin = UniversityAdministrator(
            university_id=university_id,
            user_id=user_id,
            is_primary=is_primary,
            is_deleted=False,
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        return admin

    @staticmethod
    async def remove_university_admin(db: AsyncSession, admin: UniversityAdministrator) -> None:
        admin.is_deleted = True
        admin.updated_at = datetime.now(timezone.utc)
        await db.commit()

    # --- Department Operations ---

    @staticmethod
    async def create_department(db: AsyncSession, dept: Department) -> Department:
        db.add(dept)
        await db.commit()
        await db.refresh(dept)
        return dept

    @staticmethod
    async def get_department_by_id(db: AsyncSession, department_id: uuid.UUID) -> Optional[Department]:
        stmt = (
            select(Department)
            .where(and_(Department.id == department_id, Department.is_deleted.is_(False)))
            .options(
                selectinload(Department.university),
                selectinload(Department.head_of_department),
                selectinload(Department.faculty_affiliations),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_department_by_code(db: AsyncSession, university_id: uuid.UUID, code: str) -> Optional[Department]:
        stmt = select(Department).where(
            and_(
                Department.university_id == university_id,
                func.upper(Department.code) == code.upper().strip(),
                Department.is_deleted.is_(False),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_departments(db: AsyncSession, university_id: uuid.UUID) -> List[Department]:
        stmt = (
            select(Department)
            .where(and_(Department.university_id == university_id, Department.is_deleted.is_(False)))
            .options(selectinload(Department.head_of_department))
            .order_by(Department.name.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update_department(db: AsyncSession, dept: Department, update_data: Dict[str, Any]) -> Department:
        for key, value in update_data.items():
            if hasattr(dept, key) and value is not None:
                setattr(dept, key, value)
        dept.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(dept)
        return dept

    @staticmethod
    async def soft_delete_department(db: AsyncSession, dept: Department) -> Department:
        dept.is_deleted = True
        dept.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(dept)
        return dept

    # --- Faculty Affiliation Operations ---

    @staticmethod
    async def create_faculty_affiliation(db: AsyncSession, aff: FacultyAffiliation) -> FacultyAffiliation:
        db.add(aff)
        await db.commit()
        await db.refresh(aff)
        return aff

    @staticmethod
    async def get_faculty_affiliation_by_id(db: AsyncSession, affiliation_id: uuid.UUID) -> Optional[FacultyAffiliation]:
        stmt = (
            select(FacultyAffiliation)
            .where(and_(FacultyAffiliation.id == affiliation_id, FacultyAffiliation.is_deleted.is_(False)))
            .options(
                selectinload(FacultyAffiliation.faculty),
                selectinload(FacultyAffiliation.university),
                selectinload(FacultyAffiliation.department),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_active_faculty_affiliation(db: AsyncSession, faculty_id: uuid.UUID) -> Optional[FacultyAffiliation]:
        stmt = select(FacultyAffiliation).where(
            and_(
                FacultyAffiliation.faculty_id == faculty_id,
                FacultyAffiliation.status == AffiliationStatus.ACTIVE,
                FacultyAffiliation.is_deleted.is_(False),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_faculty_affiliation_by_dept(db: AsyncSession, faculty_id: uuid.UUID, department_id: uuid.UUID) -> Optional[FacultyAffiliation]:
        stmt = select(FacultyAffiliation).where(
            and_(
                FacultyAffiliation.faculty_id == faculty_id,
                FacultyAffiliation.department_id == department_id,
                FacultyAffiliation.is_deleted.is_(False),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_pending_affiliations(db: AsyncSession, university_id: uuid.UUID) -> List[FacultyAffiliation]:
        stmt = (
            select(FacultyAffiliation)
            .where(
                and_(
                    FacultyAffiliation.university_id == university_id,
                    FacultyAffiliation.status == AffiliationStatus.PENDING,
                    FacultyAffiliation.is_deleted.is_(False),
                )
            )
            .options(
                selectinload(FacultyAffiliation.faculty),
                selectinload(FacultyAffiliation.department),
            )
            .order_by(FacultyAffiliation.created_at.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update_affiliation(db: AsyncSession, aff: FacultyAffiliation, update_data: Dict[str, Any]) -> FacultyAffiliation:
        for key, value in update_data.items():
            if hasattr(aff, key) and value is not None:
                setattr(aff, key, value)
        aff.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(aff)
        return aff

    # --- Academic Intake & Team Allocation Operations ---

    @staticmethod
    async def create_intake(db: AsyncSession, intake: AcademicIntake) -> AcademicIntake:
        db.add(intake)
        await db.commit()
        await db.refresh(intake)
        return intake

    @staticmethod
    async def get_intake_by_id(db: AsyncSession, intake_id: uuid.UUID) -> Optional[AcademicIntake]:
        stmt = (
            select(AcademicIntake)
            .where(and_(AcademicIntake.id == intake_id, AcademicIntake.is_deleted.is_(False)))
            .options(
                selectinload(AcademicIntake.university),
                selectinload(AcademicIntake.challenge),
                selectinload(AcademicIntake.allocations).selectinload(IntakeTeamAllocation.team),
                selectinload(AcademicIntake.allocations).selectinload(IntakeTeamAllocation.faculty_mentor),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_intake_by_univ_and_challenge(db: AsyncSession, university_id: uuid.UUID, challenge_id: uuid.UUID) -> Optional[AcademicIntake]:
        stmt = select(AcademicIntake).where(
            and_(
                AcademicIntake.university_id == university_id,
                AcademicIntake.challenge_id == challenge_id,
                AcademicIntake.status != IntakeStatus.DECLINED,
                AcademicIntake.is_deleted.is_(False),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_intakes_for_university(db: AsyncSession, university_id: uuid.UUID, status: Optional[str] = None) -> List[AcademicIntake]:
        filters = [
            AcademicIntake.university_id == university_id,
            AcademicIntake.is_deleted.is_(False),
        ]
        if status:
            filters.append(AcademicIntake.status == status)

        stmt = (
            select(AcademicIntake)
            .where(and_(*filters))
            .options(
                selectinload(AcademicIntake.challenge),
                selectinload(AcademicIntake.allocations),
            )
            .order_by(AcademicIntake.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update_intake(db: AsyncSession, intake: AcademicIntake, update_data: Dict[str, Any]) -> AcademicIntake:
        for key, value in update_data.items():
            if hasattr(intake, key) and value is not None:
                setattr(intake, key, value)
        intake.version += 1
        intake.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(intake)
        return intake

    @staticmethod
    async def create_team_allocation(db: AsyncSession, alloc: IntakeTeamAllocation) -> IntakeTeamAllocation:
        db.add(alloc)
        await db.commit()
        await db.refresh(alloc)
        return alloc

    @staticmethod
    async def get_team_allocation(db: AsyncSession, allocation_id: uuid.UUID) -> Optional[IntakeTeamAllocation]:
        stmt = (
            select(IntakeTeamAllocation)
            .where(and_(IntakeTeamAllocation.id == allocation_id, IntakeTeamAllocation.is_deleted.is_(False)))
            .options(
                selectinload(IntakeTeamAllocation.team),
                selectinload(IntakeTeamAllocation.faculty_mentor),
                selectinload(IntakeTeamAllocation.department),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    # --- Capacity & Pre-Condition Helper Queries ---

    @staticmethod
    async def count_active_faculty_mentorships(db: AsyncSession, faculty_id: uuid.UUID) -> int:
        stmt = select(func.count(IntakeTeamAllocation.id)).where(
            and_(
                IntakeTeamAllocation.faculty_mentor_id == faculty_id,
                IntakeTeamAllocation.status.in_([TeamAllocationStatus.ALLOCATED, TeamAllocationStatus.ACTIVE]),
                IntakeTeamAllocation.is_deleted.is_(False),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one()

    @staticmethod
    async def has_active_challenge_mentorship(db: AsyncSession, faculty_id: uuid.UUID, challenge_id: uuid.UUID) -> bool:
        stmt = (
            select(IntakeTeamAllocation.id)
            .join(AcademicIntake, IntakeTeamAllocation.intake_id == AcademicIntake.id)
            .where(
                and_(
                    IntakeTeamAllocation.faculty_mentor_id == faculty_id,
                    AcademicIntake.challenge_id == challenge_id,
                    IntakeTeamAllocation.status.in_([TeamAllocationStatus.ALLOCATED, TeamAllocationStatus.ACTIVE]),
                    IntakeTeamAllocation.is_deleted.is_(False),
                )
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def has_active_academic_bindings(db: AsyncSession, university_id: uuid.UUID) -> bool:
        # Check active affiliations
        aff_stmt = select(FacultyAffiliation.id).where(
            and_(
                FacultyAffiliation.university_id == university_id,
                FacultyAffiliation.status == AffiliationStatus.ACTIVE,
                FacultyAffiliation.is_deleted.is_(False),
            )
        )
        aff_result = await db.execute(aff_stmt)
        if aff_result.scalar_one_or_none() is not None:
            return True

        # Check active intakes
        intake_stmt = select(AcademicIntake.id).where(
            and_(
                AcademicIntake.university_id == university_id,
                AcademicIntake.status.in_([IntakeStatus.ROUTED, IntakeStatus.ACCEPTED, IntakeStatus.ASSIGNED]),
                AcademicIntake.is_deleted.is_(False),
            )
        )
        intake_result = await db.execute(intake_stmt)
        return intake_result.scalar_one_or_none() is not None
