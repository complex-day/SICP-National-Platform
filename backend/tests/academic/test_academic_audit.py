import pytest
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.services.academic_service import AcademicService
from app.models.audit_log import AuditLog
from app.schemas.academic import (
    UniversityCreate,
    UniversityStatusUpdate,
    DepartmentCreate,
    FacultyAffiliationCreate,
    FacultyAffiliationVerify,
)
from app.core.constants import UniversityStatus, AuditAction


@pytest.mark.asyncio
async def test_academic_audit_logging(
    db_session: AsyncSession, faculty_user, second_faculty_user, platform_admin, published_challenge
):
    # 1. Register University -> UNIVERSITY_REGISTERED
    univ = await AcademicService.register_university(
        db_session,
        UniversityCreate(name="IIIT Hyderabad", code="IIITH", district="Hyderabad", state="Telangana", contact_email="admin@iiit.ac.in"),
        faculty_user,
    )
    stmt = select(AuditLog).where(AuditLog.action == AuditAction.UNIVERSITY_REGISTERED)
    res = await db_session.execute(stmt)
    assert res.scalar_one_or_none() is not None

    # 2. Verify University -> UNIVERSITY_VERIFIED
    await AcademicService.update_university_status(
        db_session, univ.id, UniversityStatusUpdate(status=UniversityStatus.VERIFIED, version=1), platform_admin
    )
    stmt = select(AuditLog).where(AuditLog.action == AuditAction.UNIVERSITY_VERIFIED)
    res = await db_session.execute(stmt)
    assert res.scalar_one_or_none() is not None

    # 3. Create Department -> DEPARTMENT_CREATED
    dept = await AcademicService.create_department(
        db_session, univ.id, DepartmentCreate(name="Cognitive Science", code="COGSCI"), faculty_user
    )
    stmt = select(AuditLog).where(AuditLog.action == AuditAction.DEPARTMENT_CREATED)
    res = await db_session.execute(stmt)
    assert res.scalar_one_or_none() is not None

    # 4. Request Affiliation -> FACULTY_AFFILIATION_REQUESTED
    aff = await AcademicService.request_faculty_affiliation(
        db_session,
        FacultyAffiliationCreate(university_id=univ.id, department_id=dept.id, designation="Professor"),
        second_faculty_user,
    )
    stmt = select(AuditLog).where(AuditLog.action == AuditAction.FACULTY_AFFILIATION_REQUESTED)
    res = await db_session.execute(stmt)
    assert res.scalar_one_or_none() is not None

    # 5. Approve Affiliation -> FACULTY_AFFILIATION_APPROVED
    await AcademicService.verify_faculty_affiliation(
        db_session, aff.id, FacultyAffiliationVerify(action="APPROVE"), faculty_user
    )
    stmt = select(AuditLog).where(AuditLog.action == AuditAction.FACULTY_AFFILIATION_APPROVED)
    res = await db_session.execute(stmt)
    assert res.scalar_one_or_none() is not None

    # 6. Claim Challenge -> CHALLENGE_CLAIMED_BY_UNIVERSITY
    intake = await AcademicService.claim_challenge(db_session, published_challenge.id, univ.id, faculty_user)
    stmt = select(AuditLog).where(AuditLog.action == AuditAction.CHALLENGE_CLAIMED_BY_UNIVERSITY)
    res = await db_session.execute(stmt)
    assert res.scalar_one_or_none() is not None
