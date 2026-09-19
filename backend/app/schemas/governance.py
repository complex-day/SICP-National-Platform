"""Pydantic Schemas for Governance & Impact Intelligence (Module 7)."""

import uuid
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# 1. Geographic Telemetry & Scorecards
# ============================================================================

class DistrictScorecardResponse(BaseModel):
    district: str
    state: str
    total_challenges: int
    resolved_challenges: int
    resolution_rate_percentage: float
    active_projects: int
    completed_projects: int
    active_teams: int
    active_students: int
    participating_universities: int
    total_csr_allocated: float
    total_csr_released: float
    total_csr_utilized: float
    total_beneficiaries: int
    estimated_economic_value: float
    average_sroi_ratio: float
    district_innovation_index: float
    snapshot_date: date


class StateHeatmapResponse(BaseModel):
    state: str
    total_districts: int
    total_challenges: int
    resolved_challenges: int
    resolution_rate_percentage: float
    total_active_projects: int
    total_csr_released: float
    total_beneficiaries: int
    average_district_diri_score: float
    districts: List[DistrictScorecardResponse]


class NationalOverviewResponse(BaseModel):
    total_states: int
    total_districts: int
    total_challenges: int
    total_resolved_challenges: int
    national_resolution_rate: float
    total_active_teams: int
    total_universities: int
    total_projects: int
    total_csr_released: float
    total_beneficiaries_reached: int
    total_economic_value_created: float
    macro_sroi_ratio: float
    top_districts: List[DistrictScorecardResponse]
    top_universities: List[Dict[str, Any]]
    top_sponsors: List[Dict[str, Any]]


# ============================================================================
# 2. SROI & Project Intelligence
# ============================================================================

class ProjectSROIResponse(BaseModel):
    project_id: uuid.UUID
    project_title: str
    district: str
    state: str
    domain_category: str
    capital_invested_inr: float
    beneficiaries_reached: int
    annual_civic_savings_inr: float
    net_present_societal_value_inr: float
    sroi_ratio: float
    psi_score: float
    deadweight_rate: float = 0.20
    displacement_rate: float = 0.05
    drop_off_rate: float = 0.15
    discount_rate: float = 0.08
    time_horizon_years: int = 3
    is_verified_by_evaluator: bool
    domain_metrics: Optional[Dict[str, Any]] = None


# ============================================================================
# 3. Stakeholder Scorecards
# ============================================================================

class SRIScorecardResponse(BaseModel):
    partner_id: uuid.UUID
    company_name: str
    domain: str
    total_agreements_count: int
    active_agreements_count: int
    fulfilled_agreements_count: int
    withdrawn_agreements_count: int
    total_promised_amount: float
    total_released_amount: float
    total_utilized_amount: float
    total_mentorship_hours_completed: float
    fulfillment_score: float
    timeliness_score: float
    retention_score: float
    mentorship_score: float
    sri_score: float
    reliability_tier: str
    snapshot_date: date


class UPIScorecardResponse(BaseModel):
    university_id: uuid.UUID
    university_name: str
    state: str
    claimed_challenges_count: int
    allocated_teams_count: int
    active_projects_count: int
    completed_projects_count: int
    milestones_approved_count: int
    faculty_mentors_active_count: int
    industry_sponsored_projects_count: int
    total_funding_secured: float
    claim_execution_score: float
    milestone_velocity_score: float
    faculty_mentorship_score: float
    industry_sponsorship_score: float
    pilot_conversion_score: float
    upi_score: float
    ranking_tier: str
    snapshot_date: date


# ============================================================================
# 4. Pipeline Conversion Funnel
# ============================================================================

class FunnelStageDTO(BaseModel):
    stage_number: int
    stage_name: str
    count: int
    conversion_rate_percentage: float
    average_dwell_days: float


class FunnelVelocityResponse(BaseModel):
    total_challenges_initiated: int
    stages: List[FunnelStageDTO]
    overall_funnel_conversion_percentage: float


# ============================================================================
# 5. Compliance & Reports
# ============================================================================

class MCACSR1ReportResponse(BaseModel):
    partner_id: uuid.UUID
    company_name: str
    cin_number: str
    financial_year: str
    total_csr_budget_inr: float
    total_committed_funds_inr: float
    total_approved_funds_inr: float
    total_released_funds_inr: float
    total_utilized_funds_inr: float
    unutilized_funds_inr: float
    csr_utilization_percentage: float
    cost_per_beneficiary_inr: float
    funding_efficiency_ratio: float
    beneficiaries_reached: int
    supported_projects: List[Dict[str, Any]]
    mca_section_135_declaration: str = "This report satisfies CSR compliance verification under Section 135 of the Companies Act, 2013."
    generated_at: datetime


class NAACNIRFReportResponse(BaseModel):
    university_id: uuid.UUID
    university_name: str
    state: str
    academic_year: str
    claimed_challenges_count: int
    active_teams_count: int
    completed_projects_count: int
    faculty_mentors_count: int
    total_mentorship_hours: float
    industry_co_sponsorship_amount: float
    upi_score: float
    ranking_tier: str
    innovation_evidence_records: List[Dict[str, Any]]
    generated_at: datetime


# ============================================================================
# 6. Public Open Data Transparency
# ============================================================================

class PublicTransparencyResponse(BaseModel):
    platform_name: str = "Societal Innovation Collaboration Platform (SICP)"
    report_timestamp: datetime
    sha256_digest: str
    total_challenges_submitted: int
    total_challenges_resolved: int
    total_students_engaged: int
    total_universities_participating: int
    total_corporate_partners: int
    total_csr_funds_deployed_inr: float
    total_verified_beneficiaries: int
    estimated_economic_savings_inr: float
    domain_breakdown: Dict[str, int]
    district_rollups: List[Dict[str, Any]]


# ============================================================================
# 7. Admin Snapshot Recalculate Request
# ============================================================================

class SnapshotRecalculateRequest(BaseModel):
    district: Optional[str] = None
    state: Optional[str] = None
    partner_id: Optional[uuid.UUID] = None
    university_id: Optional[uuid.UUID] = None
    recalculate_all: bool = Field(default=False)


class SnapshotRecalculateResponse(BaseModel):
    recalculated: bool
    districts_updated_count: int
    universities_updated_count: int
    sponsors_updated_count: int
    message: str
    recalculated_at: datetime
