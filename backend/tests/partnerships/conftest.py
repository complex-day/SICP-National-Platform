import pytest
import pytest_asyncio
from uuid import uuid4
from datetime import datetime, date, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.role_profiles import FacultyProfile, StudentProfile, CitizenProfile, IndustryProfile
from app.models.challenge import Challenge
from app.models.team import Team, TeamMember
from app.core.constants import (
    UserRole,
    UserStatus,
    ChallengeStatus,
    ChallengeVisibility,
    ChallengeCategory,
    TeamStatus,
    TeamVisibility,
    TeamMemberRole,
    TeamMemberStatus,
    UniversityStatus,
    AffiliationStatus,
    IntakeStatus,
    IntakeType,
    TeamAllocationStatus,
    ProjectStatus,
    ProjectStage,
    MilestoneStatus,
)
from app.models.academic import (
    University,
    UniversityAdministrator,
    Department,
    FacultyAffiliation,
    AcademicIntake,
    IntakeTeamAllocation,
)
from app.models.project import (
    InnovationProject,
    ProjectMilestone,
    ProjectDeliverable,
    ProjectReview,
    ProjectUpdate,
)
from app.core.security import get_password_hash, create_access_token


@pytest_asyncio.fixture
async def platform_admin(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"admin_{uuid4().hex[:6]}@sicp.gov.in",
        full_name="Platform SuperAdmin",
        password_hash=get_password_hash("AdminPass123!"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
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
        role=UserRole.FACULTY,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    profile = FacultyProfile(
        user_id=user.id,
        experience_years=12,
        specialization="Sensors & Embedded IoT",
    )
    db_session.add(profile)
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def student_leader(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"leader_{uuid4().hex[:6]}@student.iitb.ac.in",
        full_name="Rohan Verma",
        password_hash=get_password_hash("StudentPass123!"),
        role=UserRole.STUDENT,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    profile = StudentProfile(
        user_id=user.id,
        skills=["Python", "Embedded C", "IoT"],
        graduation_year=2026,
    )
    db_session.add(profile)
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def student_member(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"member_{uuid4().hex[:6]}@student.iitb.ac.in",
        full_name="Priya Patel",
        password_hash=get_password_hash("StudentPass123!"),
        role=UserRole.STUDENT,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    profile = StudentProfile(
        user_id=user.id,
        skills=["Circuit Design", "React", "CAD"],
        graduation_year=2026,
    )
    db_session.add(profile)
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def industry_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"csr_lead_{uuid4().hex[:6]}@tcs.com",
        full_name="Vikramaditya Rao",
        password_hash=get_password_hash("IndustryPass123!"),
        role=UserRole.INDUSTRY,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    profile = IndustryProfile(
        id=uuid4(),
        user_id=user.id,
        company_name="Tata Consultancy Services CSR Foundation",
        domain="Information Technology & Rural Telemetry",
        csr_budget=50000000.00,
        website="https://www.tcs.com/csr",
    )
    db_session.add(profile)
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def corporate_mentor_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"mentor_expert_{uuid4().hex[:6]}@intel.com",
        full_name="Ananya Deshmukh",
        password_hash=get_password_hash("MentorPass123!"),
        role=UserRole.INDUSTRY,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    profile = IndustryProfile(
        id=uuid4(),
        user_id=user.id,
        company_name="Intel Labs India",
        domain="Semiconductors & Embedded Edge AI",
        csr_budget=20000000.00,
        website="https://www.intel.in",
    )
    db_session.add(profile)
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def university(db_session: AsyncSession, faculty_user: User) -> University:
    univ = University(
        id=uuid4(),
        name="Indian Institute of Technology Bombay",
        code=f"IITB_{uuid4().hex[:4].upper()}",
        state="Maharashtra",
        district="Mumbai Suburban",
        contact_email="admin@iitb.ac.in",
        status=UniversityStatus.VERIFIED,
        verified_by=faculty_user.id,
        verified_at=datetime.now(timezone.utc),
        created_by=faculty_user.id,
        version=1,
        is_deleted=False,
    )
    db_session.add(univ)
    await db_session.commit()
    await db_session.refresh(univ)
    return univ


@pytest_asyncio.fixture
async def department(db_session: AsyncSession, university: University, faculty_user: User) -> Department:
    dept = Department(
        id=uuid4(),
        university_id=university.id,
        name="Electrical & Computer Engineering",
        code=f"ECE_{uuid4().hex[:4].upper()}",
        head_of_department_id=faculty_user.id,
        specializations=["IoT Systems", "Embedded Firmware", "Signal Processing"],
        is_deleted=False,
    )
    db_session.add(dept)
    await db_session.commit()
    await db_session.refresh(dept)
    return dept



@pytest_asyncio.fixture
async def challenge(db_session: AsyncSession, platform_admin: User) -> Challenge:
    chal = Challenge(
        id=uuid4(),
        title="Automated Water Contamination Detection in Rural Tanks",
        description="Developing a low-cost, multi-parameter IoT sensing station for rural community water reservoirs.",
        category=ChallengeCategory.WATER,
        citizen_id=platform_admin.id,
        created_by=platform_admin.id,
        status=ChallengeStatus.PUBLISHED,
        visibility=ChallengeVisibility.PUBLIC,
        district="Wardha",
        state="Maharashtra",
        latitude=20.7453,
        longitude=78.6022,
        affected_population=15000,
        version=1,
    )
    db_session.add(chal)
    await db_session.commit()
    await db_session.refresh(chal)
    return chal


@pytest_asyncio.fixture
async def student_team(db_session: AsyncSession, challenge: Challenge, student_leader: User, student_member: User) -> Team:
    team = Team(
        id=uuid4(),
        name=f"AquaInnovators_{uuid4().hex[:4]}",
        description="Multidisciplinary engineering cohort designing IoT water biosensors.",
        challenge_id=challenge.id,
        created_by=student_leader.id,
        status=TeamStatus.OPEN,
        visibility=TeamVisibility.PUBLIC,
        max_members=4,
        skills_needed=["IoT", "Chemistry", "CAD"],
        version=1,
    )
    db_session.add(team)
    await db_session.commit()
    await db_session.refresh(team)

    leader_m = TeamMember(
        id=uuid4(),
        team_id=team.id,
        user_id=student_leader.id,
        role=TeamMemberRole.LEADER,
        status=TeamMemberStatus.ACTIVE,
    )
    member_m = TeamMember(
        id=uuid4(),
        team_id=team.id,
        user_id=student_member.id,
        role=TeamMemberRole.MEMBER,
        status=TeamMemberStatus.ACTIVE,
    )
    db_session.add_all([leader_m, member_m])
    await db_session.commit()
    return team


@pytest_asyncio.fixture
async def academic_intake(
    db_session: AsyncSession, challenge: Challenge, university: University, department: Department, faculty_user: User
) -> AcademicIntake:
    intake = AcademicIntake(
        id=uuid4(),
        challenge_id=challenge.id,
        university_id=university.id,
        status=IntakeStatus.ACCEPTED,
        intake_type=IntakeType.DIRECT_CLAIM,
        match_score=92.50,
        claimed_by=faculty_user.id,
        claimed_at=datetime.now(timezone.utc),
        version=1,
        is_deleted=False,
    )
    db_session.add(intake)
    await db_session.commit()
    await db_session.refresh(intake)
    return intake


@pytest_asyncio.fixture
async def intake_team_allocation(
    db_session: AsyncSession, academic_intake: AcademicIntake, student_team: Team, department: Department, faculty_user: User
) -> IntakeTeamAllocation:
    allocation = IntakeTeamAllocation(
        id=uuid4(),
        intake_id=academic_intake.id,
        team_id=student_team.id,
        department_id=department.id,
        faculty_mentor_id=faculty_user.id,
        status=TeamAllocationStatus.ALLOCATED,
        allocated_by=faculty_user.id,
        allocated_at=datetime.now(timezone.utc),
        is_deleted=False,
    )
    db_session.add(allocation)
    await db_session.commit()
    await db_session.refresh(allocation)
    return allocation


@pytest_asyncio.fixture
async def innovation_project(
    db_session: AsyncSession,
    intake_team_allocation: IntakeTeamAllocation,
    challenge: Challenge,
    student_team: Team,
    university: University,
    department: Department,
    faculty_user: User,
) -> InnovationProject:
    project = InnovationProject(
        id=uuid4(),
        title="AquaSense Rural Telemetry Station",
        abstract="Solar-powered multi-sensor probe communicating over LoRaWAN to rural health dashboards.",
        intake_team_allocation_id=intake_team_allocation.id,
        challenge_id=challenge.id,
        team_id=student_team.id,
        university_id=university.id,
        department_id=department.id,
        primary_faculty_mentor_id=faculty_user.id,
        status="ACTIVE",
        current_stage="PROTOTYPE_DEVELOPMENT",
        progress_percentage=40,
        repository_url="https://github.com/sicp-innovations/aquasense-iot",
        created_by=faculty_user.id,
        version=1,
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    return project


@pytest_asyncio.fixture
async def project_milestone(
    db_session: AsyncSession,
    innovation_project: InnovationProject,
    faculty_user: User,
) -> ProjectMilestone:
    milestone = ProjectMilestone(
        id=uuid4(),
        project_id=innovation_project.id,
        sequence_index=1,
        title="Hardware Architecture & PCB Schematic Validation",
        description="Design and fabrication of 4-layer sensor interface board with isolated analog front-end.",
        weight=40,
        is_mandatory=True,
        due_date=date(2026, 12, 1),
        status="APPROVED",
        created_by=faculty_user.id,
        version=1,
    )
    db_session.add(milestone)
    await db_session.commit()
    await db_session.refresh(milestone)
    return milestone



@pytest_asyncio.fixture
async def active_m5_project(innovation_project: InnovationProject) -> InnovationProject:
    return innovation_project


@pytest_asyncio.fixture
async def approved_milestone(project_milestone: ProjectMilestone) -> ProjectMilestone:
    return project_milestone


@pytest_asyncio.fixture
async def corporate_mentor(corporate_mentor_user: User) -> User:
    return corporate_mentor_user


@pytest_asyncio.fixture
async def verified_partner(
    db_session: AsyncSession,
    industry_user: User,
    platform_admin: User,
) -> dict:
    from app.models.partnership import IndustryPartner
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
    await db_session.commit()
    await db_session.refresh(partner)
    return {
        "id": str(partner.id),
        "company_name": partner.company_name,
        "verification_status": partner.verification_status,
        "cin_number": partner.cin_number,
        "csr_budget": partner.csr_budget,
    }


def auth_headers_for(user: User) -> dict:
    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    token = create_access_token(
        subject=user.id,
        role=role_str,
        email=user.email,
        name=user.full_name,
    )
    return {"Authorization": f"Bearer {token}"}

