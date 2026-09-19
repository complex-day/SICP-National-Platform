"""Pure Domain Calculation Engines for Governance & Impact Intelligence (Module 7).

Contains deterministic calculation engines:
1. SROICalculator: Standard Social Return on Investment with 3-year NPV discounting and proxy valuations.
2. SRICalculator: Sponsor Reliability Index (4-factor composite: fulfillment, timeliness, retention, mentorship).
3. UPICalculator: University Participation Index (5-factor composite: claim, milestone velocity, faculty mentorship, sponsorship, pilot conversion).
4. PSICalculator: Project Success Index (6-factor composite: milestone completion, on-time delivery, pilot verification, adoption reach, review score, sustainability).
5. DIRICalculator: District Innovation & Resolution Index (4-factor composite: resolution rate, team density, sponsorship coverage, pilot ratio).
6. CSRUtilizationEngine: Committed, approved, released, utilized capital and efficiency metrics.
"""

from typing import Optional, Dict
from pydantic import BaseModel, Field


# ============================================================================
# 1. SROI (Social Return on Investment) Engine
# ============================================================================

class SROIInput(BaseModel):
    capital_invested: float = Field(default=0.0, description="Total capital invested in INR (CSR, grants, equipment)")
    beneficiaries_count: int = Field(default=0, description="Verified or target people benefited")
    annual_civic_savings: float = Field(default=0.0, description="Annual civic / municipal cost savings in INR")
    domain_category: str = Field(default="GENERAL", description="Challenge / project domain category")
    deadweight_rate: float = Field(default=0.20, description="Impact that would have happened anyway (15-25%)")
    displacement_rate: float = Field(default=0.05, description="Impact displaced from existing programs (5-10%)")
    drop_off_rate: float = Field(default=0.15, description="Deterioration rate per year (10-20%)")
    discount_rate: float = Field(default=0.08, description="Standard social discount rate (8%)")
    time_horizon_years: int = Field(default=3, description="Calculation horizon in years")


class SROIResult(BaseModel):
    capital_invested: float
    beneficiaries_count: int
    annual_civic_savings: float
    per_capita_proxy_value: float
    gross_annual_value: float
    net_present_value: float
    sroi_ratio: float
    deadweight_rate: float
    displacement_rate: float
    drop_off_rate: float
    discount_rate: float
    time_horizon_years: int


class SROICalculator:
    DOMAIN_PROXIES: Dict[str, float] = {
        "WATER_CONSERVATION": 500.0,
        "WATER": 500.0,
        "HEALTHCARE": 1200.0,
        "HEALTH": 1200.0,
        "CLEANTECH_ENERGY": 800.0,
        "ENERGY": 800.0,
        "AGRICULTURE": 500.0,
        "AGRO": 500.0,
        "WASTE_MANAGEMENT": 600.0,
        "EDUCATION": 700.0,
        "CIVIC_INFRASTRUCTURE": 750.0,
    }
    DEFAULT_PROXY = 400.0

    @classmethod
    def get_domain_proxy_value(cls, domain: str) -> float:
        normalized = domain.upper().replace(" ", "_").replace("-", "_")
        return cls.DOMAIN_PROXIES.get(normalized, cls.DEFAULT_PROXY)

    @classmethod
    def calculate(cls, data: SROIInput) -> SROIResult:
        # Prevent division by zero
        effective_capital = data.capital_invested if data.capital_invested > 0 else 1.00
        proxy_val = cls.get_domain_proxy_value(data.domain_category)
        gross_annual = data.annual_civic_savings + (data.beneficiaries_count * proxy_val)

        # 3-year NPV calculation
        npv = 0.0
        for t in range(1, data.time_horizon_years + 1):
            # net_value_t = gross * (1 - deadweight) * (1 - displacement) * (1 - drop_off)^(t-1)
            drop_factor = (1.0 - data.drop_off_rate) ** (t - 1)
            net_val_t = gross_annual * (1.0 - data.deadweight_rate) * (1.0 - data.displacement_rate) * drop_factor
            pv_t = net_val_t / ((1.0 + data.discount_rate) ** t)
            npv += pv_t

        sroi_ratio = round(npv / effective_capital, 2)

        return SROIResult(
            capital_invested=effective_capital if data.capital_invested > 0 else 1.0,
            beneficiaries_count=data.beneficiaries_count,
            annual_civic_savings=data.annual_civic_savings,
            per_capita_proxy_value=proxy_val,
            gross_annual_value=round(gross_annual, 2),
            net_present_value=round(npv, 2),
            sroi_ratio=sroi_ratio,
            deadweight_rate=data.deadweight_rate,
            displacement_rate=data.displacement_rate,
            drop_off_rate=data.drop_off_rate,
            discount_rate=data.discount_rate,
            time_horizon_years=data.time_horizon_years,
        )


# ============================================================================
# 2. SRI (Sponsor Reliability Index) Engine
# ============================================================================

class SRIInput(BaseModel):
    total_promised_funds: float = Field(default=0.0)
    total_released_funds: float = Field(default=0.0)
    total_scheduled_tranches: int = Field(default=0)
    on_time_tranches: int = Field(default=0)
    total_executed_agreements: int = Field(default=0)
    withdrawn_agreements: int = Field(default=0)
    promised_mentorship_hours: float = Field(default=0.0)
    completed_mentorship_hours: float = Field(default=0.0)


class SRIResult(BaseModel):
    fulfillment_score: float
    timeliness_score: float
    retention_score: float
    mentorship_score: float
    sri_score: float
    reliability_tier: str


class SRICalculator:
    @classmethod
    def calculate(cls, data: SRIInput) -> SRIResult:
        # 1. Fulfillment Score (S1)
        if data.total_promised_funds <= 0:
            s1 = 100.0
        else:
            s1 = min(100.0, (data.total_released_funds / data.total_promised_funds) * 100.0)

        # 2. Timeliness Score (S2)
        if data.total_scheduled_tranches <= 0:
            s2 = 100.0
        else:
            s2 = min(100.0, (data.on_time_tranches / data.total_scheduled_tranches) * 100.0)

        # 3. Retention Score (S3)
        if data.total_executed_agreements <= 0:
            s3 = 100.0
        else:
            withdrawal_rate = (data.withdrawn_agreements / data.total_executed_agreements) * 100.0
            s3 = max(0.0, 100.0 - withdrawal_rate)

        # 4. Mentorship Score (S4)
        if data.promised_mentorship_hours <= 0:
            s4 = 100.0
        else:
            s4 = min(100.0, (data.completed_mentorship_hours / data.promised_mentorship_hours) * 100.0)

        # Composite SRI = 0.40(S1) + 0.30(S2) + 0.20(S3) + 0.10(S4)
        composite = round(0.40 * s1 + 0.30 * s2 + 0.20 * s3 + 0.10 * s4, 2)

        # Tier assignment
        if composite >= 90.0:
            tier = "PLATINUM"
        elif composite >= 80.0:
            tier = "GOLD"
        elif composite >= 65.0:
            tier = "SILVER"
        elif composite >= 50.0:
            tier = "AT_RISK"
        else:
            tier = "DELINQUENT"

        return SRIResult(
            fulfillment_score=round(s1, 2),
            timeliness_score=round(s2, 2),
            retention_score=round(s3, 2),
            mentorship_score=round(s4, 2),
            sri_score=composite,
            reliability_tier=tier,
        )


# ============================================================================
# 3. UPI (University Participation Index) Engine
# ============================================================================

class UPIInput(BaseModel):
    claimed_challenges: int = Field(default=0)
    allocated_intakes: int = Field(default=0)
    submitted_milestones: int = Field(default=0)
    approved_milestones: int = Field(default=0)
    total_affiliated_faculty: int = Field(default=0)
    active_faculty_mentors: int = Field(default=0)
    total_active_projects: int = Field(default=0)
    sponsored_projects: int = Field(default=0)
    pilot_converted_projects: int = Field(default=0)


class UPIResult(BaseModel):
    claim_execution_score: float
    milestone_velocity_score: float
    faculty_mentorship_score: float
    industry_sponsorship_score: float
    pilot_conversion_score: float
    upi_score: float
    ranking_tier: str


class UPICalculator:
    @classmethod
    def calculate(cls, data: UPIInput) -> UPIResult:
        # U1: Claim Execution Rate
        if data.claimed_challenges <= 0:
            u1 = 0.0
        else:
            u1 = min(100.0, (data.allocated_intakes / data.claimed_challenges) * 100.0)

        # U2: Milestone Velocity
        if data.submitted_milestones <= 0:
            u2 = 0.0
        else:
            u2 = min(100.0, (data.approved_milestones / data.submitted_milestones) * 100.0)

        # U3: Faculty Mentorship Depth
        if data.total_affiliated_faculty <= 0:
            u3 = 0.0
        else:
            u3 = min(100.0, (data.active_faculty_mentors / data.total_affiliated_faculty) * 100.0)

        # U4: Industry Co-Sponsorship Rate
        if data.total_active_projects <= 0:
            u4 = 0.0
        else:
            u4 = min(100.0, (data.sponsored_projects / data.total_active_projects) * 100.0)

        # U5: Field Pilot Conversion Rate
        if data.total_active_projects <= 0:
            u5 = 0.0
        else:
            u5 = min(100.0, (data.pilot_converted_projects / data.total_active_projects) * 100.0)

        # Composite UPI = 0.25(U1) + 0.25(U2) + 0.20(U3) + 0.15(U4) + 0.15(U5)
        composite = round(0.25 * u1 + 0.25 * u2 + 0.20 * u3 + 0.15 * u4 + 0.15 * u5, 2)

        # Ranking Tier
        if composite >= 85.0:
            tier = "TIER_1"
        elif composite >= 70.0:
            tier = "TIER_2"
        elif composite >= 50.0:
            tier = "TIER_3"
        else:
            tier = "EMERGING"

        return UPIResult(
            claim_execution_score=round(u1, 2),
            milestone_velocity_score=round(u2, 2),
            faculty_mentorship_score=round(u3, 2),
            industry_sponsorship_score=round(u4, 2),
            pilot_conversion_score=round(u5, 2),
            upi_score=composite,
            ranking_tier=tier,
        )


# ============================================================================
# 4. PSI (Project Success Index) Engine
# ============================================================================

class PSIInput(BaseModel):
    total_planned_milestones: int = Field(default=0)
    approved_milestones: int = Field(default=0)
    on_time_milestones: int = Field(default=0)
    pilot_verified: bool = Field(default=False)
    pilot_active: bool = Field(default=False)
    target_beneficiaries: int = Field(default=0)
    verified_beneficiaries: int = Field(default=0)
    average_faculty_review_score: float = Field(default=0.0)
    sustainability_score: float = Field(default=0.0)


class PSIResult(BaseModel):
    completion_score: float
    on_time_score: float
    pilot_score: float
    adoption_score: float
    review_score: float
    sustainability_score: float
    psi_score: float


class PSICalculator:
    @classmethod
    def calculate(cls, data: PSIInput) -> PSIResult:
        # M1: Milestone Completion
        if data.total_planned_milestones <= 0:
            m1 = 0.0
        else:
            m1 = min(100.0, (data.approved_milestones / data.total_planned_milestones) * 100.0)

        # M2: On-Time Delivery
        if data.approved_milestones <= 0:
            m2 = 0.0
        else:
            m2 = min(100.0, (data.on_time_milestones / data.approved_milestones) * 100.0)

        # M3: Pilot Success Score
        if data.pilot_verified:
            m3 = 100.0
        elif data.pilot_active:
            m3 = 50.0
        else:
            m3 = 0.0

        # M4: Adoption / Beneficiary Reach
        if data.target_beneficiaries <= 0:
            m4 = 100.0 if data.verified_beneficiaries > 0 else 0.0
        else:
            m4 = min(100.0, (data.verified_beneficiaries / data.target_beneficiaries) * 100.0)

        # M5: Faculty Review Score
        m5 = min(100.0, max(0.0, data.average_faculty_review_score))

        # M6: Deployment Sustainability
        m6 = min(100.0, max(0.0, data.sustainability_score))

        # Composite PSI = 0.25(M1) + 0.20(M2) + 0.20(M3) + 0.15(M4) + 0.10(M5) + 0.10(M6)
        composite = round(0.25 * m1 + 0.20 * m2 + 0.20 * m3 + 0.15 * m4 + 0.10 * m5 + 0.10 * m6, 2)

        return PSIResult(
            completion_score=round(m1, 2),
            on_time_score=round(m2, 2),
            pilot_score=round(m3, 2),
            adoption_score=round(m4, 2),
            review_score=round(m5, 2),
            sustainability_score=round(m6, 2),
            psi_score=composite,
        )


# ============================================================================
# 5. DIRI (District Innovation & Resolution Index) Engine
# ============================================================================

class DIRIInput(BaseModel):
    total_challenges: int = Field(default=0)
    resolved_challenges: int = Field(default=0)
    active_teams: int = Field(default=0)
    population: int = Field(default=100000)
    sponsored_projects: int = Field(default=0)
    total_projects: int = Field(default=0)
    deployed_pilots: int = Field(default=0)


class DIRIResult(BaseModel):
    resolution_rate: float
    team_density_score: float
    sponsorship_coverage: float
    pilot_ratio: float
    diri_score: float


class DIRICalculator:
    @classmethod
    def calculate(cls, data: DIRIInput) -> DIRIResult:
        # Resolution Rate (40%)
        if data.total_challenges <= 0:
            res_rate = 0.0
        else:
            res_rate = min(100.0, (data.resolved_challenges / data.total_challenges) * 100.0)

        # Team Density Score (30%) - normalized per 100k pop (target: 10 teams per 100k = 100%)
        pop_100k = max(1.0, data.population / 100000.0)
        density = data.active_teams / pop_100k
        density_score = min(100.0, (density / 10.0) * 100.0)

        # Sponsorship Coverage (20%)
        if data.total_projects <= 0:
            spon_cov = 0.0
        else:
            spon_cov = min(100.0, (data.sponsored_projects / data.total_projects) * 100.0)

        # Pilot Ratio (10%)
        if data.total_projects <= 0:
            pilot_ratio = 0.0
        else:
            pilot_ratio = min(100.0, (data.deployed_pilots / data.total_projects) * 100.0)

        composite = round(0.40 * res_rate + 0.30 * density_score + 0.20 * spon_cov + 0.10 * pilot_ratio, 2)

        return DIRIResult(
            resolution_rate=round(res_rate, 2),
            team_density_score=round(density_score, 2),
            sponsorship_coverage=round(spon_cov, 2),
            pilot_ratio=round(pilot_ratio, 2),
            diri_score=composite,
        )


# ============================================================================
# 6. CSR Capital Utilization Engine
# ============================================================================

class CSRUtilizationInput(BaseModel):
    committed_funds: float = Field(default=0.0)
    approved_funds: float = Field(default=0.0)
    released_funds: float = Field(default=0.0)
    utilized_funds: float = Field(default=0.0)
    verified_beneficiaries: int = Field(default=0)
    gross_economic_value_created: float = Field(default=0.0)


class CSRUtilizationResult(BaseModel):
    committed_funds: float
    approved_funds: float
    released_funds: float
    utilized_funds: float
    unutilized_funds: float
    utilization_percentage: float
    cost_per_beneficiary: float
    funding_efficiency_ratio: float


class CSRUtilizationEngine:
    @classmethod
    def calculate(cls, data: CSRUtilizationInput) -> CSRUtilizationResult:
        unutilized = max(0.0, data.released_funds - data.utilized_funds)
        if data.released_funds <= 0:
            util_pct = 0.0
        else:
            util_pct = min(100.0, (data.utilized_funds / data.released_funds) * 100.0)

        if data.verified_beneficiaries <= 0:
            cost_per_ben = 0.0
        else:
            cost_per_ben = data.utilized_funds / data.verified_beneficiaries

        if data.utilized_funds <= 0:
            eff_ratio = 0.0
        else:
            eff_ratio = data.gross_economic_value_created / data.utilized_funds

        return CSRUtilizationResult(
            committed_funds=round(data.committed_funds, 2),
            approved_funds=round(data.approved_funds, 2),
            released_funds=round(data.released_funds, 2),
            utilized_funds=round(data.utilized_funds, 2),
            unutilized_funds=round(unutilized, 2),
            utilization_percentage=round(util_pct, 2),
            cost_per_beneficiary=round(cost_per_ben, 2),
            funding_efficiency_ratio=round(eff_ratio, 2),
        )
