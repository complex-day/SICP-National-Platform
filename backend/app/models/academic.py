import uuid
from datetime import datetime
from typing import Optional, List, Any, Dict
from sqlalchemy import String, Integer, Text, ForeignKey, DateTime, Boolean, JSON, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin


class University(Base, TimestampMixin):
    __tablename__ = "universities"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="PENDING_VERIFICATION", nullable=False, index=True)
    accreditation_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, default=dict, nullable=True)
    domain_expertise: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    departments: Mapped[List["Department"]] = relationship(
        "Department", back_populates="university", cascade="all, delete-orphan", lazy="selectin"
    )
    administrators: Mapped[List["UniversityAdministrator"]] = relationship(
        "UniversityAdministrator", back_populates="university", cascade="all, delete-orphan", lazy="selectin"
    )
    affiliations: Mapped[List["FacultyAffiliation"]] = relationship(
        "FacultyAffiliation", back_populates="university", lazy="selectin"
    )
    intakes: Mapped[List["AcademicIntake"]] = relationship(
        "AcademicIntake", back_populates="university", lazy="selectin"
    )


class UniversityAdministrator(Base, TimestampMixin):
    __tablename__ = "university_administrators"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    university_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    university: Mapped["University"] = relationship("University", back_populates="administrators")
    user: Mapped["User"] = relationship("User", lazy="selectin")


class Department(Base, TimestampMixin):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    university_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    head_of_department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    specializations: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    university: Mapped["University"] = relationship("University", back_populates="departments")
    head_of_department: Mapped[Optional["User"]] = relationship("User", foreign_keys=[head_of_department_id], lazy="selectin")
    faculty_affiliations: Mapped[List["FacultyAffiliation"]] = relationship(
        "FacultyAffiliation", back_populates="department", lazy="selectin"
    )


class FacultyAffiliation(Base, TimestampMixin):
    __tablename__ = "faculty_affiliations"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    faculty_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    university_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    department_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    designation: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="PENDING", nullable=False, index=True)
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    faculty: Mapped["User"] = relationship("User", foreign_keys=[faculty_id], lazy="selectin")
    university: Mapped["University"] = relationship("University", back_populates="affiliations")
    department: Mapped["Department"] = relationship("Department", back_populates="faculty_affiliations")


class AcademicIntake(Base, TimestampMixin):
    __tablename__ = "academic_intakes"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("challenges.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    university_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("universities.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(30), default="ROUTED", nullable=False, index=True)
    intake_type: Mapped[str] = mapped_column(String(30), default="AI_MATCHED", nullable=False)
    match_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0.00, nullable=False)
    match_reasoning: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, default=dict, nullable=True)
    claimed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    claimed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    university: Mapped["University"] = relationship("University", back_populates="intakes")
    challenge: Mapped["Challenge"] = relationship("Challenge", lazy="selectin")
    allocations: Mapped[List["IntakeTeamAllocation"]] = relationship(
        "IntakeTeamAllocation", back_populates="intake", cascade="all, delete-orphan", lazy="selectin"
    )


class IntakeTeamAllocation(Base, TimestampMixin):
    __tablename__ = "intake_team_allocations"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    intake_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("academic_intakes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    team_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    department_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    faculty_mentor_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(30), default="ALLOCATED", nullable=False, index=True)
    allocated_by: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    allocated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    intake: Mapped["AcademicIntake"] = relationship("AcademicIntake", back_populates="allocations")
    team: Mapped["Team"] = relationship("Team", lazy="selectin")
    department: Mapped["Department"] = relationship("Department", lazy="selectin")
    faculty_mentor: Mapped["User"] = relationship("User", foreign_keys=[faculty_mentor_id], lazy="selectin")
