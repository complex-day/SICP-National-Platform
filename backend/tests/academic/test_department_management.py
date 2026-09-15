import pytest
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.academic_service import AcademicService
from app.schemas.academic import (
    UniversityCreate,
    UniversityStatusUpdate,
    DepartmentCreate,
    DepartmentHODUpdate,
    FacultyAffiliationCreate,
    FacultyAffiliationVerify,
)
from app.core.constants import UniversityStatus
from app.core.exceptions import (
    DuplicateDepartmentError,
    DepartmentNotFoundError,
    InvalidHODAffiliationError,
    AuthorizationError,
)


@pytest.mark.asyncio
async def test_department_creation_and_hod_assignment(
    db_session: AsyncSession, faculty_user, second_faculty_user, platform_admin
):
    # Register and verify university
    univ = await AcademicService.register_university(
        db_session,
        UniversityCreate(name="IIT Madras", code="IITM", district="Chennai", state="Tamil Nadu", contact_email="admin@iitm.ac.in"),
        faculty_user,
    )
    await AcademicService.update_university_status(
        db_session, univ.id, UniversityStatusUpdate(status=UniversityStatus.VERIFIED, version=1), platform_admin
    )

    # Create department
    dept_data = DepartmentCreate(
        name="Mechanical Engineering",
        code="MECH",
        specializations=["Thermodynamics", "Robotics"],
    )
    dept = await AcademicService.create_department(db_session, univ.id, dept_data, faculty_user)
    assert dept.id is not None
    assert dept.code == "MECH"

    # Affiliate second_faculty_user to this dept
    aff = await AcademicService.request_faculty_affiliation(
        db_session,
        FacultyAffiliationCreate(university_id=univ.id, department_id=dept.id, designation="Professor"),
        second_faculty_user,
    )
    await AcademicService.verify_faculty_affiliation(
        db_session, aff.id, FacultyAffiliationVerify(action="APPROVE"), faculty_user
    )

    # Assign active affiliated faculty as HOD
    updated_dept = await AcademicService.update_department_hod(
        db_session, dept.id, DepartmentHODUpdate(head_of_department_id=second_faculty_user.id), faculty_user
    )
    assert updated_dept.head_of_department_id == second_faculty_user.id


@pytest.mark.asyncio
async def test_hod_assignment_rejects_unaffiliated_faculty(db_session: AsyncSession, faculty_user, second_faculty_user):
    univ = await AcademicService.register_university(
        db_session,
        UniversityCreate(name="IIT Kanpur", code="IITK", district="Kanpur", state="Uttar Pradesh", contact_email="admin@iitk.ac.in"),
        faculty_user,
    )
    dept = await AcademicService.create_department(
        db_session, univ.id, DepartmentCreate(name="Aerospace Engineering", code="AERO"), faculty_user
    )

    # second_faculty_user has NO affiliation with IITK AERO dept
    with pytest.raises(InvalidHODAffiliationError):
        await AcademicService.update_department_hod(
            db_session, dept.id, DepartmentHODUpdate(head_of_department_id=second_faculty_user.id), faculty_user
        )
