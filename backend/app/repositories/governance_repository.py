"""Governance & Impact Intelligence Repository (Module 7).

Handles database persistence, queries, and analytical aggregations for:
- DistrictImpactSnapshot
- UniversityPerformanceSnapshot
- SponsorReliabilitySnapshot
- ProjectImpactReport
"""

import uuid
from datetime import date, datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy import select, func, and_, or_, distinct, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.governance import (
    DistrictImpactSnapshot,
    UniversityPerformanceSnapshot,
    SponsorReliabilitySnapshot,
    ProjectImpactReport,
)
from app.models.challenge import Challenge
from app.models.team import Team, TeamMember
from app.models.academic import University, AcademicIntake, IntakeTeamAllocation
from app.models.project import InnovationProject, ProjectMilestone
from app.models.partnership import IndustryPartner, PartnershipAgreement, SponsorshipDisbursement, MentorshipSession
from app.services.governance_calculators import (
    SROICalculator,
    SROIInput,
    SRICalculator,
    SRIInput,
    UPICalculator,
    UPIInput,
    PSICalculator,
    PSIInput,
    DIRICalculator,
    DIRIInput,
)


class GovernanceRepository:
    """Repository handling analytical read models and aggregations across M1-M6."""

    def __init__(self, db: Optional[AsyncSession] = None):
        self._db = db

    def _get_session(self, db: Optional[AsyncSession] = None) -> AsyncSession:
        session = db or self._db
        if session is None:
            raise ValueError("AsyncSession must be provided either at init or method call.")
        return session

    # =========================================================================
    # 1. District Snapshot Operations
    # =========================================================================

    async def save_district_snapshot(
        self, snapshot: DistrictImpactSnapshot, db: Optional[AsyncSession] = None
    ) -> DistrictImpactSnapshot:
        session = self._get_session(db)
        session.add(snapshot)
        await session.commit()
        await session.refresh(snapshot)
        return snapshot

    async def get_district_snapshot(
        self, district: str, db: Optional[AsyncSession] = None
    ) -> Optional[DistrictImpactSnapshot]:
        session = self._get_session(db)
        stmt = (
            select(DistrictImpactSnapshot)
            .where(func.lower(DistrictImpactSnapshot.district) == district.strip().lower())
            .order_by(DistrictImpactSnapshot.snapshot_date.desc(), DistrictImpactSnapshot.created_at.desc())
            .limit(1)
        )
        res = await session.execute(stmt)
        return res.scalar_one_or_none()

    async def list_district_snapshots(
        self, state: Optional[str] = None, db: Optional[AsyncSession] = None
    ) -> List[DistrictImpactSnapshot]:
        session = self._get_session(db)
        stmt = select(DistrictImpactSnapshot)
        if state:
            stmt = stmt.where(func.lower(DistrictImpactSnapshot.state) == state.strip().lower())
        stmt = stmt.order_by(DistrictImpactSnapshot.district_innovation_index.desc())
        res = await session.execute(stmt)
        return list(res.scalars().all())

    # =========================================================================
    # 2. University Snapshot Operations
    # =========================================================================

    async def save_university_snapshot(
        self, snapshot: UniversityPerformanceSnapshot, db: Optional[AsyncSession] = None
    ) -> UniversityPerformanceSnapshot:
        session = self._get_session(db)
        session.add(snapshot)
        await session.commit()
        await session.refresh(snapshot)
        return snapshot

    async def get_university_snapshot(
        self, university_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> Optional[UniversityPerformanceSnapshot]:
        session = self._get_session(db)
        stmt = (
            select(UniversityPerformanceSnapshot)
            .where(UniversityPerformanceSnapshot.university_id == university_id)
            .order_by(UniversityPerformanceSnapshot.snapshot_date.desc(), UniversityPerformanceSnapshot.created_at.desc())
            .limit(1)
        )
        res = await session.execute(stmt)
        return res.scalar_one_or_none()

    async def list_university_snapshots(
        self, state: Optional[str] = None, tier: Optional[str] = None, db: Optional[AsyncSession] = None
    ) -> List[UniversityPerformanceSnapshot]:
        session = self._get_session(db)
        stmt = select(UniversityPerformanceSnapshot)
        filters = []
        if state:
            filters.append(func.lower(UniversityPerformanceSnapshot.state) == state.strip().lower())
        if tier:
            filters.append(UniversityPerformanceSnapshot.ranking_tier == tier)
        if filters:
            stmt = stmt.where(and_(*filters))
        stmt = stmt.order_by(UniversityPerformanceSnapshot.upi_score.desc())
        res = await session.execute(stmt)
        return list(res.scalars().all())

    # =========================================================================
    # 3. Sponsor Reliability Operations
    # =========================================================================

    async def save_sponsor_snapshot(
        self, snapshot: SponsorReliabilitySnapshot, db: Optional[AsyncSession] = None
    ) -> SponsorReliabilitySnapshot:
        session = self._get_session(db)
        session.add(snapshot)
        await session.commit()
        await session.refresh(snapshot)
        return snapshot

    async def get_sponsor_snapshot(
        self, partner_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> Optional[SponsorReliabilitySnapshot]:
        session = self._get_session(db)
        stmt = (
            select(SponsorReliabilitySnapshot)
            .where(SponsorReliabilitySnapshot.partner_id == partner_id)
            .order_by(SponsorReliabilitySnapshot.snapshot_date.desc(), SponsorReliabilitySnapshot.created_at.desc())
            .limit(1)
        )
        res = await session.execute(stmt)
        return res.scalar_one_or_none()

    async def list_sponsor_snapshots(
        self, tier: Optional[str] = None, db: Optional[AsyncSession] = None
    ) -> List[SponsorReliabilitySnapshot]:
        session = self._get_session(db)
        stmt = select(SponsorReliabilitySnapshot)
        if tier:
            stmt = stmt.where(SponsorReliabilitySnapshot.reliability_tier == tier)
        stmt = stmt.order_by(SponsorReliabilitySnapshot.sri_score.desc())
        res = await session.execute(stmt)
        return list(res.scalars().all())

    # =========================================================================
    # 4. Project Impact Report Operations
    # =========================================================================

    async def save_project_impact_report(
        self, report: ProjectImpactReport, db: Optional[AsyncSession] = None
    ) -> ProjectImpactReport:
        session = self._get_session(db)
        session.add(report)
        await session.commit()
        await session.refresh(report)
        return report

    async def get_project_impact_report(
        self, project_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> Optional[ProjectImpactReport]:
        session = self._get_session(db)
        stmt = select(ProjectImpactReport).where(ProjectImpactReport.project_id == project_id)
        res = await session.execute(stmt)
        return res.scalar_one_or_none()

    async def list_project_impact_reports(
        self, district: Optional[str] = None, state: Optional[str] = None, db: Optional[AsyncSession] = None
    ) -> List[ProjectImpactReport]:
        session = self._get_session(db)
        stmt = select(ProjectImpactReport)
        filters = []
        if district:
            filters.append(func.lower(ProjectImpactReport.district) == district.strip().lower())
        if state:
            filters.append(func.lower(ProjectImpactReport.state) == state.strip().lower())
        if filters:
            stmt = stmt.where(and_(*filters))
        res = await session.execute(stmt)
        return list(res.scalars().all())
