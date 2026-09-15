import pytest
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.academic_service import AcademicService
from app.schemas.academic import (
    UniversityCreate,
    UniversityStatusUpdate,
    DepartmentCreate,
    FacultyAffiliationCreate,
    FacultyAffiliationVerify,
    IntakeTeamAllocationCreate,
)
from app.core.constants import UniversityStatus, IntakeStatus
from app.core.exceptions import (
    DuplicateChallengeClaimError,
    FacultyMentorCapacityExceededError,
    DuplicateChallengeMentorshipError,
    BadRequestError,
)


@pytest.mark.asyncio
async def test_challenge_intake_and_team_allocation_workflow(
    db_session: AsyncSession, faculty_user, second_faculty_user, student_team, published_challenge, platform_admin
):
    univ = await AcademicService.register_university(
        db_session,
        UniversityCreate(name="Calcutta University", code="CU", district="Kolkata", state="West Bengal", contact_email="admin@cu.edu"),
        faculty_user,
    )
    await AcademicService.update_university_status(
        db_session, univ.id, UniversityStatusUpdate(status=UniversityStatus.VERIFIED, version=1), platform_admin
    )
    dept = await AcademicService.create_department(
        db_session, univ.id, DepartmentCreate(name="Applied Chemistry", code="APPCHEM"), faculty_user
    )
    aff = await AcademicService.request_faculty_affiliation(
        db_session,
        FacultyAffiliationCreate(university_id=univ.id, department_id=dept.id, designation="Professor"),
        second_faculty_user,
    )
    await AcademicService.verify_faculty_affiliation(
        db_session, aff.id, FacultyAffiliationVerify(action="APPROVE"), faculty_user
    )

    # University claims published challenge
    intake = await AcademicService.claim_challenge(db_session, published_challenge.id, univ.id, faculty_user)
    assert intake.status == IntakeStatus.ACCEPTED

    # Duplicate claim by same university is blocked
    with pytest.raises(DuplicateChallengeClaimError):
        await AcademicService.claim_challenge(db_session, published_challenge.id, univ.id, faculty_user)

    # Allocate team and mentor
    alloc = await AcademicService.allocate_team_to_intake(
        db_session,
        intake.id,
        IntakeTeamAllocationCreate(team_id=student_team.id, department_id=dept.id, faculty_mentor_id=second_faculty_user.id),
        faculty_user,
    )
    assert alloc.id is not None
    assert alloc.team_id == student_team.id

    # Attempting to assign same mentor to another team on the SAME challenge is blocked
    with pytest.raises(DuplicateChallengeMentorshipError):
        await AcademicService.allocate_team_to_intake(
            db_session,
            intake.id,
            IntakeTeamAllocationCreate(team_id=student_team.id, department_id=dept.id, faculty_mentor_id=second_faculty_user.id),
            faculty_user,
        )
