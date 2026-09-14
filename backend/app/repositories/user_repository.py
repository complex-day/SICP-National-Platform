from typing import Optional, Dict, Any
import uuid
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole, UserStatus
from app.models.role_profiles import CitizenProfile, FacultyProfile, StudentProfile, IndustryProfile


class UserRepository:
    """Repository layer for User and profile database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """Fetch user by primary key ID."""
        stmt = select(User).where(User.id == user_id, User.is_deleted == False)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """Fetch user by unique email."""
        stmt = select(User).where(User.email == email.lower().strip(), User.is_deleted == False)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str) -> Optional[User]:
        """Fetch user by unique phone number."""
        if not phone:
            return None
        stmt = select(User).where(User.phone == phone.strip(), User.is_deleted == False)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self,
        full_name: str,
        email: str,
        password_hash: str,
        role: str,
        phone: Optional[str] = None,
        status: str = UserStatus.ACTIVE.value
    ) -> User:
        """Create a new user record."""
        user = User(
            id=uuid.uuid4(),
            full_name=full_name,
            email=email.lower().strip(),
            phone=phone.strip() if phone else None,
            password_hash=password_hash,
            role=role,
            status=status,
            is_verified=False,
            trust_score=50.0
        )
        self.session.add(user)
        await self.session.flush()
        return user

    async def create_role_profile(
        self,
        user_id: uuid.UUID,
        role: str,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> None:
        """Create corresponding role-specific profile record."""
        extra_data = extra_data or {}
        if role == UserRole.CITIZEN.value:
            profile = CitizenProfile(
                user_id=user_id,
                district=extra_data.get("district"),
                state=extra_data.get("state"),
                total_reports=0
            )
            self.session.add(profile)
        elif role == UserRole.FACULTY.value:
            profile = FacultyProfile(
                user_id=user_id,
                specialization=extra_data.get("specialization"),
                experience_years=extra_data.get("experience_years", 0)
            )
            self.session.add(profile)
        elif role == UserRole.STUDENT.value:
            profile = StudentProfile(
                user_id=user_id,
                skills=extra_data.get("skills", []),
                graduation_year=extra_data.get("graduation_year")
            )
            self.session.add(profile)
        elif role == UserRole.INDUSTRY.value:
            profile = IndustryProfile(
                id=uuid.uuid4(),
                user_id=user_id,
                company_name=extra_data.get("company_name", "Organization"),
                domain=extra_data.get("domain"),
                csr_budget=extra_data.get("csr_budget"),
                website=extra_data.get("website")
            )
            self.session.add(profile)
        await self.session.flush()

    async def update(self, user: User, update_data: Dict[str, Any]) -> User:
        """Update user record attributes."""
        for key, value in update_data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        await self.session.flush()
        return user
