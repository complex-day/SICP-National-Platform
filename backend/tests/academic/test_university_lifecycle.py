import pytest
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.academic_service import AcademicService
from app.schemas.academic import UniversityCreate, UniversityUpdate, UniversityStatusUpdate
from app.core.constants import UniversityStatus
from app.core.exceptions import (
    DuplicateUniversityError,
    UniversityNotFoundError,
    ConcurrencyConflictError,
    ActiveAcademicBindingsExistError,
    AuthorizationError,
)


@pytest.mark.asyncio
async def test_university_registration_and_get(db_session: AsyncSession, faculty_user):
    data = UniversityCreate(
        name="Indian Institute of Science",
        code="IISC",
        district="Bengaluru",
        state="Karnataka",
        contact_email="admin@iisc.ac.in",
        domain_expertise=["Deep Tech", "Nanotechnology"],
    )
    univ = await AcademicService.register_university(db_session, data, faculty_user)
    assert univ.id is not None
    assert univ.status == UniversityStatus.PENDING_VERIFICATION
    assert univ.code == "IISC"

    # Fetch
    fetched = await AcademicService.get_university(db_session, univ.id)
    assert fetched.name == "Indian Institute of Science"


@pytest.mark.asyncio
async def test_duplicate_university_registration_blocked(db_session: AsyncSession, faculty_user):
    data = UniversityCreate(
        name="Delhi Technological University",
        code="DTU",
        district="Delhi",
        state="Delhi",
        contact_email="admin@dtu.ac.in",
    )
    await AcademicService.register_university(db_session, data, faculty_user)

    # Duplicate code
    with pytest.raises(DuplicateUniversityError):
        await AcademicService.register_university(
            db_session,
            UniversityCreate(
                name="Different Name",
                code="DTU",
                district="Delhi",
                state="Delhi",
                contact_email="other@dtu.ac.in",
            ),
            faculty_user,
        )


@pytest.mark.asyncio
async def test_platform_admin_verify_university(db_session: AsyncSession, faculty_user, platform_admin):
    data = UniversityCreate(
        name="Anna University",
        code="ANNA",
        district="Chennai",
        state="Tamil Nadu",
        contact_email="admin@annauniv.edu",
    )
    univ = await AcademicService.register_university(db_session, data, faculty_user)

    # Non-admin cannot verify
    with pytest.raises(AuthorizationError):
        await AcademicService.update_university_status(
            db_session, univ.id, UniversityStatusUpdate(status=UniversityStatus.VERIFIED, version=1), faculty_user
        )

    # Admin verifies
    updated = await AcademicService.update_university_status(
        db_session, univ.id, UniversityStatusUpdate(status=UniversityStatus.VERIFIED, version=1), platform_admin
    )
    assert updated.status == UniversityStatus.VERIFIED
    assert updated.verified_by == platform_admin.id


@pytest.mark.asyncio
async def test_university_optimistic_locking(db_session: AsyncSession, faculty_user):
    data = UniversityCreate(
        name="Osmania University",
        code="OU",
        district="Hyderabad",
        state="Telangana",
        contact_email="admin@ou.ac.in",
    )
    univ = await AcademicService.register_university(db_session, data, faculty_user)

    # Version mismatch raises ConcurrencyConflictError
    with pytest.raises(ConcurrencyConflictError):
        await AcademicService.update_university(
            db_session, univ.id, UniversityUpdate(district="Secunderabad", version=99), faculty_user
        )
