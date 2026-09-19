"""Governance & Impact Intelligence Models (Module 7).

Defines persistence models for analytical snapshots and reports:
- DistrictImpactSnapshot
- UniversityPerformanceSnapshot
- SponsorReliabilitySnapshot
- ProjectImpactReport
"""

from datetime import datetime, timezone, date
from typing import Optional, Any
import uuid
from sqlalchemy import String, Integer, Float, Boolean, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID


class DistrictImpactSnapshot(Base):
    __tablename__ = "district_impact_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    total_challenges: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resolved_challenges: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_projects: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_projects: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_teams: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_students: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    participating_universities: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    total_csr_allocated: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_csr_released: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_csr_utilized: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_beneficiaries: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    estimated_economic_value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    average_sroi_ratio: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    district_innovation_index: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class UniversityPerformanceSnapshot(Base):
    __tablename__ = "university_performance_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    university_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("universities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    university_name: Mapped[str] = mapped_column(String(255), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    claimed_challenges_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    allocated_teams_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_projects_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_projects_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    milestones_approved_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    faculty_mentors_active_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    industry_sponsored_projects_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    total_funding_secured: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    upi_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    ranking_tier: Mapped[str] = mapped_column(String(20), default="TIER_3", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    university = relationship("University")


class SponsorReliabilitySnapshot(Base):
    __tablename__ = "sponsor_reliability_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    partner_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("industry_partners.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[str] = mapped_column(String(100), default="GENERAL", nullable=False)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    total_agreements_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_agreements_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    fulfilled_agreements_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    withdrawn_agreements_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    total_promised_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_released_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_utilized_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_mentorship_hours_completed: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    sri_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    reliability_tier: Mapped[str] = mapped_column(String(20), default="RELIABLE", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    partner = relationship("IndustryPartner")


class ProjectImpactReport(Base):
    __tablename__ = "project_impact_reports"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("projects.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    project_title: Mapped[str] = mapped_column(String(255), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    domain_category: Mapped[str] = mapped_column(String(50), nullable=False)

    capital_invested_inr: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    beneficiaries_reached: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    annual_economic_savings_inr: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    net_present_societal_value_inr: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    sroi_ratio: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    psi_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    domain_metrics_json: Mapped[Optional[Any]] = mapped_column(JSON, default=dict)

    is_verified_by_evaluator: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    project = relationship("InnovationProject")
