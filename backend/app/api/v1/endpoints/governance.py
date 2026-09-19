"""Governance & Impact Intelligence Endpoints (Module 7).

Prefix: /api/v1/governance
"""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user, require_roles
from app.models.user import User, UserRole
from app.services.governance_service import GovernanceService
from app.schemas.common import StandardResponse
from app.schemas.governance import (
    DistrictScorecardResponse,
    StateHeatmapResponse,
    NationalOverviewResponse,
    ProjectSROIResponse,
    SRIScorecardResponse,
    UPIScorecardResponse,
    FunnelVelocityResponse,
    MCACSR1ReportResponse,
    NAACNIRFReportResponse,
    PublicTransparencyResponse,
    SnapshotRecalculateRequest,
    SnapshotRecalculateResponse,
)

router = APIRouter(prefix="/governance", tags=["Governance & Impact Intelligence"])


@router.get("/public/transparency", response_model=StandardResponse[PublicTransparencyResponse])
async def get_public_transparency(
    db: AsyncSession = Depends(get_db),
):
    """Public, unauthenticated open data transparency ledger with cryptographic SHA-256 digest."""
    service = GovernanceService(db)
    result = await service.get_public_transparency_ledger()
    return StandardResponse(success=True, data=result)


@router.get("/overview", response_model=StandardResponse[NationalOverviewResponse])
async def get_national_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Macro-national overview dashboard with state/district leaderboards and macro SROI."""
    service = GovernanceService(db)
    result = await service.get_national_overview()
    return StandardResponse(success=True, data=result)


@router.get("/districts", response_model=StandardResponse[List[DistrictScorecardResponse]])
async def list_districts(
    state: Optional[str] = Query(None, description="Filter by state"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List district scorecards ranked by District Innovation & Resolution Index (DIRI)."""
    service = GovernanceService(db)
    if state:
        heatmap = await service.get_state_heatmap(state)
        return StandardResponse(success=True, data=heatmap.districts)
    overview = await service.get_national_overview()
    return StandardResponse(success=True, data=overview.top_districts)


@router.get("/districts/{district}", response_model=StandardResponse[DistrictScorecardResponse])
async def get_district_scorecard(
    district: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Detailed district telemetry, challenge resolution rate, team density, and local SROI."""
    service = GovernanceService(db)
    result = await service.get_district_scorecard(district)
    return StandardResponse(success=True, data=result)


@router.get("/states/{state}", response_model=StandardResponse[StateHeatmapResponse])
async def get_state_heatmap(
    state: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """State-level comparative heatmap aggregating all constituent districts."""
    service = GovernanceService(db)
    result = await service.get_state_heatmap(state)
    return StandardResponse(success=True, data=result)


@router.get("/sroi/{project_id}", response_model=StandardResponse[ProjectSROIResponse])
async def get_project_sroi(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Detailed SROI ratio and economic proxy breakdown for an innovation project."""
    service = GovernanceService(db)
    result = await service.get_project_sroi(project_id)
    return StandardResponse(success=True, data=result)


@router.get("/sponsors/reliability", response_model=StandardResponse[List[SRIScorecardResponse]])
async def list_sponsor_reliabilities(
    tier: Optional[str] = Query(None, description="Filter by tier: PLATINUM, GOLD, SILVER, AT_RISK, DELINQUENT"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.GOVERNMENT.value, UserRole.INDUSTRY.value, UserRole.ADMIN.value])),
):
    """List corporate CSR partners ranked by Sponsor Reliability Index (SRI)."""
    service = GovernanceService(db)
    result = await service.list_sponsor_reliabilities(tier)
    return StandardResponse(success=True, data=result)


@router.get("/sponsors/reliability/{partner_id}", response_model=StandardResponse[SRIScorecardResponse])
async def get_sponsor_reliability(
    partner_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.GOVERNMENT.value, UserRole.INDUSTRY.value, UserRole.ADMIN.value])),
):
    """Detailed Sponsor Reliability Index (SRI) breakdown for a specific partner."""
    service = GovernanceService(db)
    result = await service.get_sponsor_reliability(partner_id)
    return StandardResponse(success=True, data=result)


@router.get("/universities/performance", response_model=StandardResponse[List[UPIScorecardResponse]])
async def list_university_performances(
    state: Optional[str] = Query(None, description="Filter by state"),
    tier: Optional[str] = Query(None, description="Filter by tier: TIER_1, TIER_2, TIER_3, EMERGING"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List universities ranked by University Participation Index (UPI)."""
    service = GovernanceService(db)
    result = await service.list_university_performances(state, tier)
    return StandardResponse(success=True, data=result)


@router.get("/universities/performance/{university_id}", response_model=StandardResponse[UPIScorecardResponse])
async def get_university_performance(
    university_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Detailed University Participation Index (UPI) score and sub-indicators."""
    service = GovernanceService(db)
    result = await service.get_university_performance(university_id)
    return StandardResponse(success=True, data=result)


@router.get("/funnel", response_model=StandardResponse[FunnelVelocityResponse])
async def get_funnel_velocity(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.GOVERNMENT.value, UserRole.ADMIN.value])),
):
    """7-stage innovation pipeline conversion velocity and dwell time metrics."""
    service = GovernanceService(db)
    result = await service.get_pipeline_funnel_velocity()
    return StandardResponse(success=True, data=result)


@router.get("/reports/mca-csr/{partner_id}", response_model=StandardResponse[MCACSR1ReportResponse])
async def get_mca_csr1_report(
    partner_id: uuid.UUID,
    financial_year: str = Query("2025-26", description="Financial year (e.g. 2025-26)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.INDUSTRY.value, UserRole.GOVERNMENT.value, UserRole.ADMIN.value])),
):
    """Official MCA Section 135 CSR-1 compliance report export."""
    service = GovernanceService(db)
    result = await service.get_mca_csr1_report(partner_id, financial_year)
    return StandardResponse(success=True, data=result)


@router.get("/reports/naac-nirf/{university_id}", response_model=StandardResponse[NAACNIRFReportResponse])
async def get_naac_nirf_report(
    university_id: uuid.UUID,
    academic_year: str = Query("2025-26", description="Academic year (e.g. 2025-26)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.FACULTY.value, UserRole.GOVERNMENT.value, UserRole.ADMIN.value])),
):
    """Official NAAC/NIRF institutional innovation evidence package export."""
    service = GovernanceService(db)
    result = await service.get_naac_nirf_report(university_id, academic_year)
    return StandardResponse(success=True, data=result)


@router.post("/snapshots/recalculate", response_model=StandardResponse[SnapshotRecalculateResponse])
async def recalculate_snapshots(
    payload: Optional[SnapshotRecalculateRequest] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN.value])),
):
    """Admin trigger to materialize and recalculate analytical snapshots."""
    service = GovernanceService(db)
    result = await service.recalculate_snapshots(user_id=current_user.id)
    return StandardResponse(success=True, data=result)
