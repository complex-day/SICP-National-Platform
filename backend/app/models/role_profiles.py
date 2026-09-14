from typing import Optional, Any
import uuid
from sqlalchemy import String, Integer, Numeric, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin


class CitizenProfile(Base):
    __tablename__ = "citizens"

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )
    district: Mapped[Optional[str]] = mapped_column(String(150), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    total_reports: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class FacultyProfile(Base):
    __tablename__ = "faculty"

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )
    university_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, nullable=True, index=True)
    specialization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    experience_years: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class StudentProfile(Base):
    __tablename__ = "students"

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )
    university_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, nullable=True, index=True)
    skills: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    graduation_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class IndustryProfile(Base):
    __tablename__ = "industries"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    csr_budget: Mapped[Optional[float]] = mapped_column(Numeric(15, 2), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
