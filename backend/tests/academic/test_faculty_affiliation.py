import pytest
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.academic_service import AcademicService
from app.schemas.academic import (
    UniversityCreate,
    DepartmentCreate,
    FacultyAffiliationCreate,
    FacultyAffiliationVerify,
)
from app.core.constants import AffiliationStatus
from app.core.exceptions import (
    DuplicateActiveAffiliationError,
    DepartmentNotFoundError,
    AuthorizationError,
)


@pytest.mark.asyncio
async def test_faculty_affiliation_lifecycle(db_session: AsyncSession, faculty_user, second_faculty_user, student_user):
    univ = await AcademicService.register_university(
        db_session,
        UniversityCreate(name="IIT Kharagpur", code="IITKGP", district="Kharagpur", state="West Bengal", contact_email="admin@iitkgp.ac.in"),
        faculty_user,
    )
    dept = await AcademicService.create_department(
        db_session, univ.id, DepartmentCreate(name="Mining Engineering", code="MINING"), faculty_user
    )

    # Student cannot request faculty affiliation
    with pytest.raises(AuthorizationError):
        await AcademicService.request_faculty_affiliation(
            db_session,
            FacultyAffiliationCreate(university_id=univ.id, department_id=dept.id, designation="Professor"),
            student_user,
        )

    # Faculty requests affiliation
    aff = await AcademicService.request_faculty_affiliation(
        db_session,
        FacultyAffiliationCreate(university_id=univ.id, department_id=dept.id, designation="Assistant Professor"),
        second_faculty_user,
    )
    assert aff.status == AffiliationStatus.PENDING

    # University admin verifies affiliation
    verified = await AcademicService.verify_faculty_affiliation(
        db_session, aff.id, FacultyAffiliationVerify(action="APPROVE"), faculty_user
    )
    assert verified.status == AffiliationStatus.ACTIVE

    # Second active affiliation is blocked
    univ2 = await AcademicService.register_university(
        db_session,
        UniversityCreate(name="IIT Roorkee", code="IITR", district="Roorkee", state="Uttarakhand", contact_email="admin@iitr.ac.in"),
        faculty_user,
    )
    dept2 = await AcademicService.create_department(
        db_session, univ2.id, DepartmentCreate(name="Earthquake Engineering", code="EQ"), faculty_user
    )

    with pytest.raises(DuplicateActiveAffiliationError):
        await AcademicService.request_faculty_affiliation(
            db_session,
            FacultyAffiliationCreate(university_id=univ2.id, department_id=dept2.id, designation="Professor"),
            second_faculty_user,
        )
