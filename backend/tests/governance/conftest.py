"""Fixtures and test helpers for Governance & Impact Intelligence (Module 7)."""

import pytest
import pytest_asyncio
from uuid import uuid4
from datetime import datetime, date, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole, UserStatus
from app.models.role_profiles import CitizenProfile, FacultyProfile, StudentProfile, IndustryProfile
from app.models.challenge import Challenge
from app.models.team import Team, TeamMember
from app.models.academic import University, Department, AcademicIntake, IntakeTeamAllocation
from app.models.project import InnovationProject, ProjectMilestone
from app.models.partnership import IndustryPartner, PartnershipAgreement, SponsorshipDisbursement
from app.core.security import get_password_hash, create_access_token


def auth_headers_for(user: User) -> dict:
    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    token = create_access_token(
        subject=user.id,
        role=role_str,
        email=user.email,
        name=user.full_name,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def platform_admin(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"admin_{uuid4().hex[:6]}@sicp.gov.in",
        full_name="Platform SuperAdmin",
        password_hash=get_password_hash("AdminPass123!"),
        role=UserRole.ADMIN.value,
        status=UserStatus.ACTIVE.value,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def government_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"dm_{uuid4().hex[:6]}@maharashtra.gov.in",
        full_name="District Collector Wardha",
        password_hash=get_password_hash("GovPass123!"),
        role=UserRole.GOVERNMENT.value,
        status=UserStatus.ACTIVE.value,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def industry_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"csr_lead_{uuid4().hex[:6]}@tcs.com",
        full_name="Vikramaditya Rao",
        password_hash=get_password_hash("IndustryPass123!"),
        role=UserRole.INDUSTRY.value,
        status=UserStatus.ACTIVE.value,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def faculty_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"faculty_{uuid4().hex[:6]}@iitb.ac.in",
        full_name="Dr. Arvind Sharma",
        password_hash=get_password_hash("FacultyPass123!"),
        role=UserRole.FACULTY.value,
        status=UserStatus.ACTIVE.value,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def student_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"student_{uuid4().hex[:6]}@student.iitb.ac.in",
        full_name="Rohan Verma",
        password_hash=get_password_hash("StudentPass123!"),
        role=UserRole.STUDENT.value,
        status=UserStatus.ACTIVE.value,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def citizen_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"citizen_{uuid4().hex[:6]}@gmail.com",
        full_name="Ramesh Patil",
        password_hash=get_password_hash("CitizenPass123!"),
        role=UserRole.CITIZEN.value,
        status=UserStatus.ACTIVE.value,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def full_governance_seed(
    db_session: AsyncSession,
    platform_admin: User,
    government_user: User,
    industry_user: User,
    faculty_user: User,
    student_user: User,
    citizen_user: User,
) -> dict:
    """Creates an end-to-end linked test entity graph for governance analytics."""
    # 1. Challenge in Wardha
    chal = Challenge(
        id=uuid4(),
        title="Automated Water Contamination Detection in Rural Tanks",
        description="Low-cost IoT water biosensors for rural drinking water reservoirs.",
        category="WATER_CONSERVATION",
        citizen_id=citizen_user.id,
        created_by=citizen_user.id,
        status="resolved",
        visibility="public",
        district="Wardha",
        state="Maharashtra",
        latitude=20.7453,
        longitude=78.6022,
        affected_population=15000,
        version=1,
    )
    db_session.add(chal)

    # 2. Team
    team = Team(
        id=uuid4(),
        name=f"AquaInnovators_{uuid4().hex[:4]}",
        description="Multidisciplinary engineering cohort designing IoT water biosensors.",
        challenge_id=chal.id,
        created_by=student_user.id,
        status="OPEN",
        visibility="PUBLIC",
        max_members=4,
        skills_needed=["IoT", "Chemistry", "CAD"],
        version=1,
    )
    db_session.add(team)

    # 3. University
    univ = University(
        id=uuid4(),
        name="Indian Institute of Technology Bombay",
        code=f"IITB_{uuid4().hex[:4].upper()}",
        state="Maharashtra",
        district="Mumbai Suburban",
        contact_email="admin@iitb.ac.in",
        status="VERIFIED",
        created_by=faculty_user.id,
        version=1,
    )
    db_session.add(univ)

    # 4. Department
    dept = Department(
        id=uuid4(),
        university_id=univ.id,
        name="Electrical & Computer Engineering",
        code=f"ECE_{uuid4().hex[:4].upper()}",
        head_of_department_id=faculty_user.id,
        specializations=["IoT Systems", "Embedded Firmware"],
    )
    db_session.add(dept)

    # 5. Academic Intake & Allocation
    intake = AcademicIntake(
        id=uuid4(),
        challenge_id=chal.id,
        university_id=univ.id,
        status="COMPLETED",
        intake_type="DIRECT_CLAIM",
        match_score=95.0,
        claimed_by=faculty_user.id,
        claimed_at=datetime.now(timezone.utc),
        version=1,
    )
    db_session.add(intake)

    allocation = IntakeTeamAllocation(
        id=uuid4(),
        intake_id=intake.id,
        team_id=team.id,
        department_id=dept.id,
        faculty_mentor_id=faculty_user.id,
        status="ALLOCATED",
        allocated_by=faculty_user.id,
        allocated_at=datetime.now(timezone.utc),
    )
    db_session.add(allocation)

    # 6. Project
    project = InnovationProject(
        id=uuid4(),
        title="AquaSense Rural Telemetry Station",
        abstract="Solar-powered multi-sensor probe communicating over LoRaWAN.",
        intake_team_allocation_id=allocation.id,
        challenge_id=chal.id,
        team_id=team.id,
        university_id=univ.id,
        department_id=dept.id,
        primary_faculty_mentor_id=faculty_user.id,
        status="COMPLETED",
        current_stage="COMPLETED",
        progress_percentage=100,
        repository_url="https://github.com/sicp-innovations/aquasense-iot",
        created_by=faculty_user.id,
        version=1,
    )
    db_session.add(project)

    # 7. Milestones
    m1 = ProjectMilestone(
        id=uuid4(),
        project_id=project.id,
        sequence_index=1,
        title="Hardware Architecture Validation",
        description="PCB Design and probe calibration",
        weight=50,
        is_mandatory=True,
        due_date=date(2026, 10, 1),
        status="APPROVED",
        created_by=faculty_user.id,
        version=1,
    )
    m2 = ProjectMilestone(
        id=uuid4(),
        project_id=project.id,
        sequence_index=2,
        title="Field Pilot & Civic Deployment",
        description="Installation in 5 community wells",
        weight=50,
        is_mandatory=True,
        due_date=date(2026, 12, 1),
        status="APPROVED",
        created_by=faculty_user.id,
        version=1,
    )
    db_session.add_all([m1, m2])

    # 8. Industry Partner
    partner = IndustryPartner(
        id=uuid4(),
        user_id=industry_user.id,
        created_by=industry_user.id,
        company_name="Tata Consultancy Services CSR Foundation",
        domain="Information Technology & Rural Telemetry",
        cin_number=f"L22210MH1995PLC{uuid4().hex[:6].upper()}",
        csr_budget=50000000.00,
        website="https://www.tcs.com/csr",
        point_of_contact_name="Vikramaditya Rao",
        point_of_contact_email=industry_user.email,
        point_of_contact_phone="+919876543210",
        verification_status="VERIFIED",
        verified_by=platform_admin.id,
        verified_at=datetime.now(timezone.utc),
        version=1,
    )
    db_session.add(partner)

    # 9. Partnership Agreement & Disbursement
    agreement = PartnershipAgreement(
        id=uuid4(),
        partner_id=partner.id,
        project_id=project.id,
        partnership_type="CSR_GRANT",
        status="FULFILLED",
        promised_amount=500000.0,
        released_amount=500000.0,
        promised_hours=20.0,
        completed_hours=20.0,
        created_by=industry_user.id,
        version=1,
    )
    db_session.add(agreement)

    await db_session.commit()

    return {
        "challenge": chal,
        "team": team,
        "university": univ,
        "department": dept,
        "project": project,
        "partner": partner,
        "agreement": agreement,
    }
