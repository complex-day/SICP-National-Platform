import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.challenge import Challenge, ChallengeAsset
from app.models.role_profiles import CitizenProfile
from app.models.user import User, UserRole, UserStatus
from app.repositories.challenge_repository import ChallengeRepository
from app.core.constants import ChallengeCategory, ChallengeStatus, ChallengeVisibility


@pytest.mark.asyncio
async def test_repo_001_create_and_get(db_session: AsyncSession):
    """Test ChallengeRepository create and get_by_id."""
    # Create test user and citizen
    user = User(
        id=uuid.uuid4(),
        full_name="Repo Tester",
        email="repotest@example.com",
        password_hash="hash123",
        role=UserRole.CITIZEN.value,
        status=UserStatus.ACTIVE.value
    )
    citizen = CitizenProfile(user_id=user.id, district="Ranchi", state="Jharkhand")
    db_session.add(user)
    db_session.add(citizen)
    await db_session.commit()

    repo = ChallengeRepository(db_session)
    challenge = Challenge(
        id=uuid.uuid4(),
        citizen_id=citizen.user_id,
        created_by=user.id,
        title="Repository Integration Test Challenge",
        description="Repository test description satisfying length requirements for database validation.",
        category=ChallengeCategory.WATER.value,
        affected_population=300,
        latitude=23.34,
        longitude=85.30,
        status=ChallengeStatus.SUBMITTED.value,
        visibility=ChallengeVisibility.PUBLIC.value,
        version=1
    )
    created = await repo.create(challenge)
    assert created.id == challenge.id

    fetched = await repo.get_by_id(created.id)
    assert fetched is not None
    assert fetched.title == "Repository Integration Test Challenge"


@pytest.mark.asyncio
async def test_repo_002_filter_and_pagination(db_session: AsyncSession):
    """Test filtering by category and pagination."""
    user = User(
        id=uuid.uuid4(),
        full_name="Filter Tester",
        email="filtertest@example.com",
        password_hash="hash123",
        role=UserRole.CITIZEN.value,
        status=UserStatus.ACTIVE.value
    )
    citizen = CitizenProfile(user_id=user.id, district="Ranchi", state="Jharkhand")
    db_session.add(user)
    db_session.add(citizen)
    await db_session.commit()

    repo = ChallengeRepository(db_session)
    for i in range(5):
        c = Challenge(
            id=uuid.uuid4(),
            citizen_id=citizen.user_id,
            created_by=user.id,
            title=f"Challenge Item {i}",
            description="Repository test description satisfying length requirements for database validation.",
            category=ChallengeCategory.WATER.value if i < 3 else ChallengeCategory.HEALTHCARE.value,
            affected_population=100 * (i + 1),
            latitude=23.34,
            longitude=85.30,
            status=ChallengeStatus.PUBLISHED.value,
            visibility=ChallengeVisibility.PUBLIC.value,
            version=1
        )
        await repo.create(c)

    # Filter Water
    water_items, total_water = await repo.list_challenges(category="Water", page=1, limit=10)
    assert total_water == 3
    assert len(water_items) == 3

    # Pagination
    paged_items, total = await repo.list_challenges(page=1, limit=2)
    assert len(paged_items) == 2
    assert total >= 5
