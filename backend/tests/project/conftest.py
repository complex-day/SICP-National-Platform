import pytest
import pytest_asyncio
from uuid import uuid4
from datetime import datetime, date, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.role_profiles import FacultyProfile, StudentProfile, CitizenProfile
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
        full_name="Dr. Arun Sharma",
        password_hash=get_password_hash("FacultyPass123!"),
        role=UserRole.FACULTY,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.flush()

    prof = FacultyProfile(
        user_id=user.id,
        specialization="Water Quality, Desalination",
        experience_years=12,
    )
    db_session.add(prof)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def student_leader(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"leader_{uuid4().hex[:6]}@iitb.ac.in",
        full_name="Rohan Gupta (Leader)",
        password_hash=get_password_hash("StudentPass123!"),
        role=UserRole.STUDENT,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.flush()

    prof = StudentProfile(
        user_id=user.id,
        graduation_year=2026,
        skills=["Python", "Embedded C", "IoT"],
    )
    db_session.add(prof)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def student_member(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"member_{uuid4().hex[:6]}@iitb.ac.in",
        full_name="Priya Patel (Member)",
        password_hash=get_password_hash("StudentPass123!"),
        role=UserRole.STUDENT,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.flush()

    prof = StudentProfile(
        user_id=user.id,
        graduation_year=2026,
        skills=["Frontend", "React", "Data Analytics"],
    )
    db_session.add(prof)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def citizen_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"citizen_{uuid4().hex[:6]}@gmail.com",
        full_name="Rajesh Kumar",
        password_hash=get_password_hash("CitizenPass123!"),
        role=UserRole.CITIZEN,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.flush()

    prof = CitizenProfile(
        user_id=user.id,
        district="Nadia",
        state="West Bengal",
    )
    db_session.add(prof)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def published_challenge(db_session: AsyncSession, platform_admin: User, citizen_user: User) -> Challenge:
    challenge = Challenge(
        id=uuid4(),
        citizen_id=citizen_user.id,
        created_by=platform_admin.id,
        title="Community Drinking Water Arsenic Contamination",
        description="High arsenic concentration found in groundwater wells across 5 villages in Nadia district.",
        category=ChallengeCategory.WATER,
        affected_population=5000,
        latitude=23.4733,
        longitude=88.5565,
        district="Nadia",
        state="West Bengal",
        status=ChallengeStatus.PUBLISHED,
        visibility=ChallengeVisibility.PUBLIC,
        published_at=datetime.now(timezone.utc),
        version=1,
    )
    db_session.add(challenge)
    await db_session.commit()
    await db_session.refresh(challenge)
    return challenge


@pytest_asyncio.fixture
async def university(db_session: AsyncSession, faculty_user: User, platform_admin: User) -> University:
    univ = University(
        id=uuid4(),
        name="Indian Institute of Technology Bombay",
        code="IITB",
        district="Mumbai Suburban",
        state="Maharashtra",
        contact_email="admin@iitb.ac.in",
        status=UniversityStatus.VERIFIED,
        domain_expertise=["Water Purification", "IoT", "AI/ML"],
        created_by=faculty_user.id,
        verified_by=platform_admin.id,
        verified_at=datetime.now(timezone.utc),
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
        name="Department of Environmental Science & Engineering",
        code="CESE",
        head_of_department_id=faculty_user.id,
        specializations=["Water Treatment", "Desalination"],
        is_deleted=False,
    )
    db_session.add(dept)
    await db_session.commit()
    await db_session.refresh(dept)
    return dept


@pytest_asyncio.fixture
async def student_team(db_session: AsyncSession, student_leader: User, student_member: User, published_challenge: Challenge) -> Team:
    team = Team(
        id=uuid4(),
        name="AquaClean Innovators",
        description="Developing low-cost graphene filtration modules for arsenic removal.",
        challenge_id=published_challenge.id,
        created_by=student_leader.id,
        max_members=5,
        status=TeamStatus.OPEN,
        visibility=TeamVisibility.PUBLIC,
        skills_needed=["Chemical Engineering", "IoT Monitoring"],
        version=1,
    )
    db_session.add(team)
    await db_session.flush()

    leader_mem = TeamMember(
        id=uuid4(),
        team_id=team.id,
        user_id=student_leader.id,
        role=TeamMemberRole.LEADER,
        status=TeamMemberStatus.ACTIVE,
        joined_at=datetime.now(timezone.utc),
    )
    db_session.add(leader_mem)

    member_mem = TeamMember(
        id=uuid4(),
        team_id=team.id,
        user_id=student_member.id,
        role=TeamMemberRole.MEMBER,
        status=TeamMemberStatus.ACTIVE,
        joined_at=datetime.now(timezone.utc),
    )
    db_session.add(member_mem)

    await db_session.commit()
    await db_session.refresh(team)
    return team


@pytest_asyncio.fixture
async def academic_intake(db_session: AsyncSession, university: University, published_challenge: Challenge, faculty_user: User) -> AcademicIntake:
    intake = AcademicIntake(
        id=uuid4(),
        challenge_id=published_challenge.id,
        university_id=university.id,
        status=IntakeStatus.ACCEPTED,
        intake_type=IntakeType.DIRECT_CLAIM,
        match_score=88.50,
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


def auth_headers_for(user: User) -> dict:
    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    token = create_access_token(
        subject=user.id,
        role=role_str,
        email=user.email,
        name=user.full_name,
    )
    return {"Authorization": f"Bearer {token}"}

