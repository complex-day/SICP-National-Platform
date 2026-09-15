import pytest
from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.academic_repository import AcademicRepository
from app.models.academic import (
    University,
    Department,
    FacultyAffiliation,
    AcademicIntake,
    IntakeTeamAllocation,
)
from app.core.constants import UniversityStatus, AffiliationStatus, IntakeStatus, TeamAllocationStatus


@pytest.mark.asyncio
async def test_create_and_get_university(db_session: AsyncSession, faculty_user):
    univ = University(
        name="IIT Bombay",
        code="IITB",
        district="Mumbai",
        state="Maharashtra",
        contact_email="admin@iitb.ac.in",
        created_by=faculty_user.id,
        status=UniversityStatus.PENDING_VERIFICATION,
        domain_expertise=["Water", "IoT"],
    )
    created = await AcademicRepository.create_university(db_session, univ, faculty_user.id)
    assert created.id is not None
    assert created.code == "IITB"

    # Check creator was automatically made admin
    admin = await AcademicRepository.get_university_admin(db_session, created.id, faculty_user.id)
    assert admin is not None
    assert admin.is_primary is True

    # Get by ID and by code
    fetched = await AcademicRepository.get_university_by_id(db_session, created.id)
    assert fetched is not None
    assert fetched.name == "IIT Bombay"

    fetched_code = await AcademicRepository.get_university_by_code(db_session, "iitb")
    assert fetched_code is not None


@pytest.mark.asyncio
async def test_department_crud(db_session: AsyncSession, faculty_user):
    univ = University(
        name="NIT Trichy",
        code="NITT",
        district="Tiruchirappalli",
        state="Tamil Nadu",
        contact_email="admin@nitt.edu",
        created_by=faculty_user.id,
        status=UniversityStatus.VERIFIED,
    )
    created_univ = await AcademicRepository.create_university(db_session, univ, faculty_user.id)

    dept = Department(
        university_id=created_univ.id,
        name="Computer Science & Engineering",
        code="CSE",
        specializations=["Algorithms", "Cloud Computing"],
    )
    created_dept = await AcademicRepository.create_department(db_session, dept)
    assert created_dept.id is not None
    assert created_dept.code == "CSE"

    depts = await AcademicRepository.list_departments(db_session, created_univ.id)
    assert len(depts) == 1


@pytest.mark.asyncio
async def test_faculty_affiliation_repository(db_session: AsyncSession, faculty_user):
    univ = University(
        name="BITS Pilani",
        code="BITS",
        district="Pilani",
        state="Rajasthan",
        contact_email="admin@bits.edu",
        created_by=faculty_user.id,
        status=UniversityStatus.VERIFIED,
    )
    created_univ = await AcademicRepository.create_university(db_session, univ, faculty_user.id)
    dept = await AcademicRepository.create_department(
        db_session,
        Department(university_id=created_univ.id, name="Chemical Engineering", code="CHEM")
    )

    aff = FacultyAffiliation(
        faculty_id=faculty_user.id,
        university_id=created_univ.id,
        department_id=dept.id,
        designation="Professor",
        status=AffiliationStatus.PENDING,
    )
    created_aff = await AcademicRepository.create_faculty_affiliation(db_session, aff)
    assert created_aff.status == AffiliationStatus.PENDING

    pending = await AcademicRepository.list_pending_affiliations(db_session, created_univ.id)
    assert len(pending) == 1

    # Update to ACTIVE
    updated = await AcademicRepository.update_affiliation(
        db_session, created_aff, {"status": AffiliationStatus.ACTIVE, "verified_at": datetime.now(timezone.utc)}
    )
    assert updated.status == AffiliationStatus.ACTIVE

    active_aff = await AcademicRepository.get_active_faculty_affiliation(db_session, faculty_user.id)
    assert active_aff is not None
    assert active_aff.id == created_aff.id


@pytest.mark.asyncio
async def test_intake_and_team_allocation_repository(db_session: AsyncSession, faculty_user, published_challenge, student_team):
    univ = University(
        name="Jadavpur University",
        code="JU",
        district="Kolkata",
        state="West Bengal",
        contact_email="admin@ju.edu",
        created_by=faculty_user.id,
        status=UniversityStatus.VERIFIED,
    )
    created_univ = await AcademicRepository.create_university(db_session, univ, faculty_user.id)
    dept = await AcademicRepository.create_department(
        db_session,
        Department(university_id=created_univ.id, name="Civil Engineering", code="CIVIL")
    )

    intake = AcademicIntake(
        challenge_id=published_challenge.id,
        university_id=created_univ.id,
        status=IntakeStatus.ACCEPTED,
        match_score=92.5,
    )
    created_intake = await AcademicRepository.create_intake(db_session, intake)
    assert created_intake.id is not None

    # Allocate team
    alloc = IntakeTeamAllocation(
        intake_id=created_intake.id,
        team_id=student_team.id,
        department_id=dept.id,
        faculty_mentor_id=faculty_user.id,
        allocated_by=faculty_user.id,
        allocated_at=datetime.now(timezone.utc),
    )
    created_alloc = await AcademicRepository.create_team_allocation(db_session, alloc)
    assert created_alloc.id is not None

    # Check capacity helpers
    count = await AcademicRepository.count_active_faculty_mentorships(db_session, faculty_user.id)
    assert count == 1

    has_challenge_mentor = await AcademicRepository.has_active_challenge_mentorship(
        db_session, faculty_user.id, published_challenge.id
    )
    assert has_challenge_mentor is True
