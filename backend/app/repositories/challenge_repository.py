import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy import select, update, func, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.challenge import Challenge, ChallengeAsset
from app.models.role_profiles import CitizenProfile
from app.core.exceptions import NotFoundError, ConcurrencyConflictError, InvalidStateTransitionError


class ChallengeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, challenge: Challenge) -> Challenge:
        self.db.add(challenge)
        await self.db.flush()
        await self.db.refresh(challenge)
        return challenge

    async def get_by_id(self, challenge_id: uuid.UUID) -> Optional[Challenge]:
        stmt = (
            select(Challenge)
            .where(Challenge.id == challenge_id, Challenge.is_deleted == False)
            .options(selectinload(Challenge.assets), selectinload(Challenge.citizen))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_challenges(
        self,
        page: int = 1,
        limit: int = 20,
        category: Optional[str] = None,
        status: Optional[str] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        search: Optional[str] = None,
        visibility: Optional[str] = None,
        sort_by: str = "created_at_desc",
    ) -> Tuple[List[Challenge], int]:
        query = select(Challenge).where(Challenge.is_deleted == False)

        if category:
            query = query.where(Challenge.category == category)
        if status:
            query = query.where(Challenge.status == status)
        if district:
            query = query.where(Challenge.district == district)
        if state:
            query = query.where(Challenge.state == state)
        if visibility:
            query = query.where(Challenge.visibility == visibility)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Challenge.title.ilike(search_pattern),
                    Challenge.description.ilike(search_pattern),
                    Challenge.subcategory.ilike(search_pattern),
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(query.subquery())
        total_count = (await self.db.execute(count_stmt)).scalar_one()

        # Sorting
        if sort_by == "created_at_asc":
            query = query.order_by(asc(Challenge.created_at))
        elif sort_by == "affected_population_desc":
            query = query.order_by(desc(Challenge.affected_population))
        elif sort_by == "priority_score_desc":
            query = query.order_by(desc(Challenge.priority_score))
        else:
            query = query.order_by(desc(Challenge.created_at))

        # Pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit).options(selectinload(Challenge.assets), selectinload(Challenge.citizen))

        result = await self.db.execute(query)
        items = result.scalars().all()
        return items, total_count

    async def list_by_author(
        self, user_id: uuid.UUID, page: int = 1, limit: int = 20
    ) -> Tuple[List[Challenge], int]:
        query = select(Challenge).where(Challenge.created_by == user_id, Challenge.is_deleted == False)

        count_stmt = select(func.count()).select_from(query.subquery())
        total_count = (await self.db.execute(count_stmt)).scalar_one()

        offset = (page - 1) * limit
        query = (
            query.order_by(desc(Challenge.created_at))
            .offset(offset)
            .limit(limit)
            .options(selectinload(Challenge.assets), selectinload(Challenge.citizen))
        )
        result = await self.db.execute(query)
        items = result.scalars().all()
        return items, total_count

    async def update_fields(
        self, challenge_id: uuid.UUID, expected_version: int, user_id: uuid.UUID, update_data: Dict[str, Any]
    ) -> Challenge:
        update_data["version"] = expected_version + 1
        update_data["updated_by"] = user_id
        update_data["updated_at"] = datetime.now(timezone.utc)

        stmt = (
            update(Challenge)
            .where(
                Challenge.id == challenge_id,
                Challenge.version == expected_version,
                Challenge.is_deleted == False
            )
            .values(**update_data)
        )
        result = await self.db.execute(stmt)
        if result.rowcount == 0:
            # Check if challenge exists
            current = await self.get_by_id(challenge_id)
            if not current:
                raise NotFoundError(f"Challenge with ID {challenge_id} not found")
            raise ConcurrencyConflictError(
                f"Conflict detected. Expected version {expected_version}, but current version is {current.version}."
            )
        await self.db.flush()
        return await self.get_by_id(challenge_id)

    async def update_status(
        self,
        challenge_id: uuid.UUID,
        expected_version: int,
        target_status: str,
        user_id: uuid.UUID,
    ) -> Challenge:
        update_data = {
            "status": target_status,
            "version": expected_version + 1,
            "updated_by": user_id,
            "updated_at": datetime.now(timezone.utc),
        }
        if target_status == "published":
            update_data["published_at"] = datetime.now(timezone.utc)
        elif target_status == "archived":
            update_data["archived_at"] = datetime.now(timezone.utc)

        stmt = (
            update(Challenge)
            .where(
                Challenge.id == challenge_id,
                Challenge.version == expected_version,
                Challenge.is_deleted == False
            )
            .values(**update_data)
        )
        result = await self.db.execute(stmt)
        if result.rowcount == 0:
            current = await self.get_by_id(challenge_id)
            if not current:
                raise NotFoundError(f"Challenge with ID {challenge_id} not found")
            raise ConcurrencyConflictError(
                f"Conflict detected. Expected version {expected_version}, but current version is {current.version}."
            )
        await self.db.flush()
        return await self.get_by_id(challenge_id)

    async def count_assets(self, challenge_id: uuid.UUID) -> int:
        stmt = select(func.count(ChallengeAsset.id)).where(ChallengeAsset.challenge_id == challenge_id)
        return (await self.db.execute(stmt)).scalar_one()

    async def add_asset(self, asset: ChallengeAsset) -> ChallengeAsset:
        self.db.add(asset)
        await self.db.flush()
        await self.db.refresh(asset)
        return asset

    async def soft_delete(self, challenge_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        stmt = (
            update(Challenge)
            .where(Challenge.id == challenge_id, Challenge.is_deleted == False)
            .values(is_deleted=True, updated_by=user_id, updated_at=datetime.now(timezone.utc))
        )
        result = await self.db.execute(stmt)
        await self.db.flush()
        return result.rowcount > 0

    async def increment_citizen_reports(self, citizen_user_id: uuid.UUID):
        stmt = (
            update(CitizenProfile)
            .where(CitizenProfile.user_id == citizen_user_id)
            .values(total_reports=CitizenProfile.total_reports + 1)
        )
        await self.db.execute(stmt)
        await self.db.flush()
