import uuid
from datetime import datetime, date
from typing import Optional, List, Any, Dict
from sqlalchemy import String, Integer, Text, ForeignKey, DateTime, Date, Boolean, JSON, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin


class InnovationProject(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    intake_team_allocation_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("intake_team_allocations.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("challenges.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    team_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    university_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("universities.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    department_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    primary_faculty_mentor_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    secondary_mentor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    abstract: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="PROPOSAL", nullable=False, index=True)
    current_stage: Mapped[str] = mapped_column(String(30), default="CONCEPT_RESEARCH", nullable=False, index=True)
    project_outcome: Mapped[Optional[str]] = mapped_column(String(30), nullable=True, index=True)
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    repository_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    demo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    tech_stack: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    target_completion_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    actual_completion_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    closure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    intake_allocation: Mapped["IntakeTeamAllocation"] = relationship(
        "IntakeTeamAllocation", lazy="selectin"
    )
    challenge: Mapped["Challenge"] = relationship("Challenge", lazy="selectin")
    team: Mapped["Team"] = relationship("Team", lazy="selectin")
    university: Mapped["University"] = relationship("University", lazy="selectin")
    department: Mapped["Department"] = relationship("Department", lazy="selectin")
    primary_mentor: Mapped["User"] = relationship("User", foreign_keys=[primary_faculty_mentor_id], lazy="selectin")
    secondary_mentor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[secondary_mentor_id], lazy="selectin")
    milestones: Mapped[List["ProjectMilestone"]] = relationship(
        "ProjectMilestone", back_populates="project", cascade="all, delete-orphan", lazy="selectin"
    )
    deliverables: Mapped[List["ProjectDeliverable"]] = relationship(
        "ProjectDeliverable", back_populates="project", cascade="all, delete-orphan", lazy="selectin"
    )
    reviews: Mapped[List["ProjectReview"]] = relationship(
        "ProjectReview", back_populates="project", cascade="all, delete-orphan", lazy="selectin"
    )
    updates: Mapped[List["ProjectUpdate"]] = relationship(
        "ProjectUpdate", back_populates="project", cascade="all, delete-orphan", lazy="selectin"
    )


class ProjectMilestone(Base, TimestampMixin):
    __tablename__ = "project_milestones"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sequence_index: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    weight: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="DRAFT", nullable=False, index=True)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    acceptance_criteria: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    project: Mapped["InnovationProject"] = relationship("InnovationProject", back_populates="milestones")
    deliverables: Mapped[List["ProjectDeliverable"]] = relationship(
        "ProjectDeliverable", back_populates="milestone", lazy="selectin"
    )
    reviews: Mapped[List["ProjectReview"]] = relationship(
        "ProjectReview", back_populates="milestone", lazy="selectin"
    )


class ProjectDeliverable(Base, TimestampMixin):
    __tablename__ = "project_deliverables"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    milestone_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("project_milestones.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    uploader_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    deliverable_type: Mapped[str] = mapped_column(String(30), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    asset_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    sha256_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    version_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    parent_deliverable_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("project_deliverables.id", ondelete="SET NULL"), nullable=True, index=True
    )
    metadata_info: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, default=dict, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    milestone: Mapped["ProjectMilestone"] = relationship("ProjectMilestone", back_populates="deliverables")
    project: Mapped["InnovationProject"] = relationship("InnovationProject", back_populates="deliverables")
    uploader: Mapped["User"] = relationship("User", lazy="selectin")
    parent_deliverable: Mapped[Optional["ProjectDeliverable"]] = relationship(
        "ProjectDeliverable", remote_side=[id], lazy="selectin"
    )


class ProjectReview(Base):
    __tablename__ = "project_reviews"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    milestone_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("project_milestones.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    decision: Mapped[str] = mapped_column(String(30), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    rubric_breakdown: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, default=dict, nullable=True)
    feedback: Mapped[str] = mapped_column(Text, nullable=False)
    is_final_signoff: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    milestone: Mapped["ProjectMilestone"] = relationship("ProjectMilestone", back_populates="reviews")
    project: Mapped["InnovationProject"] = relationship("InnovationProject", back_populates="reviews")
    reviewer: Mapped["User"] = relationship("User", lazy="selectin")


class ProjectUpdate(Base, TimestampMixin):
    __tablename__ = "project_updates"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    update_type: Mapped[str] = mapped_column(String(30), default="SPRINT_LOG", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    attachments: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    project: Mapped["InnovationProject"] = relationship("InnovationProject", back_populates="updates")
    author: Mapped["User"] = relationship("User", lazy="selectin")
