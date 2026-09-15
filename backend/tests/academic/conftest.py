import pytest
import pytest_asyncio
from uuid import uuid4
from datetime import datetime, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.role_profiles import FacultyProfile, StudentProfile, CitizenProfile
from app.models.challenge import Challenge
from app.models.team import Team
from app.core.constants import (
    UserRole,
    UserStatus,
    ChallengeStatus,
    ChallengeVisibility,
    ChallengeCategory,
    TeamStatus,
    TeamVisibility,
)
from app.models.academic import (
    University,
    UniversityAdministrator,
    Department,
    FacultyAffiliation,
    AcademicIntake,
    IntakeTeamAllocation,
)
from app.core.security import get_password_hash


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
async def second_faculty_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"faculty2_{uuid4().hex[:6]}@iitb.ac.in",
        full_name="Dr. Neha Verma",
        password_hash=get_password_hash("FacultyPass123!"),
        role=UserRole.FACULTY,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.flush()

    prof = FacultyProfile(
        user_id=user.id,
        specialization="AI in Agriculture, IoT, Water",
        experience_years=8,
    )
    db_session.add(prof)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def student_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid4(),
        email=f"student_{uuid4().hex[:6]}@iitb.ac.in",
        full_name="Rohan Gupta",
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
        skills=["Python", "FastAPI", "Machine Learning"],
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
async def student_team(db_session: AsyncSession, student_user: User, published_challenge: Challenge) -> Team:
    team = Team(
        id=uuid4(),
        name="AquaClean Innovators",
        description="Developing low-cost graphene filtration modules for arsenic removal.",
        challenge_id=published_challenge.id,
        created_by=student_user.id,
        max_members=5,
        status=TeamStatus.OPEN,
        visibility=TeamVisibility.PUBLIC,
        skills_needed=["Chemical Engineering", "IoT Monitoring"],
        version=1,
    )
    db_session.add(team)
    await db_session.commit()
    await db_session.refresh(team)
    return team


@pytest_asyncio.fixture
async def async_client(client: AsyncClient) -> AsyncClient:
    return client
