"""Tests for UPICalculator (University Participation Index).

Verifies:
- 5-factor composite formula: 25% claim execution + 25% milestone velocity + 20% faculty mentorship + 15% sponsorship + 15% pilot conversion.
- Ranking tier assignment: TIER_1 (>=85), TIER_2 (>=70), TIER_3 (>=50), EMERGING (<50).
- Zero division safety.
"""

import pytest
from app.services.governance_calculators import UPICalculator, UPIInput, UPIResult


def test_upi_composite_formula_and_ranking():
    """Verify high-performing university receives Tier 1 ranking."""
    input_data = UPIInput(
        claimed_challenges=10,
        allocated_intakes=10,  # 100%
        submitted_milestones=20,
        approved_milestones=18,  # 90%
        total_affiliated_faculty=50,
        active_faculty_mentors=40,  # 80%
        total_active_projects=10,
        sponsored_projects=7,  # 70%
        pilot_converted_projects=8,  # 80%
    )

    result = UPICalculator.calculate(input_data)
    assert isinstance(result, UPIResult)
    assert result.claim_execution_score == 100.0
    assert result.milestone_velocity_score == 90.0
    assert result.faculty_mentorship_score == 80.0
    assert result.industry_sponsorship_score == 70.0
    assert result.pilot_conversion_score == 80.0

    # UPI = 0.25(100) + 0.25(90) + 0.20(80) + 0.15(70) + 0.15(80)
    #     = 25 + 22.5 + 16 + 10.5 + 12 = 86.0
    assert result.upi_score == 86.0
    assert result.ranking_tier == "TIER_1"


def test_upi_zero_baseline_safety():
    """Verify newly registered university with 0 claims/projects scores 0.0 cleanly."""
    input_data = UPIInput(
        claimed_challenges=0,
        allocated_intakes=0,
        submitted_milestones=0,
        approved_milestones=0,
        total_affiliated_faculty=10,
        active_faculty_mentors=0,
        total_active_projects=0,
        sponsored_projects=0,
        pilot_converted_projects=0,
    )

    result = UPICalculator.calculate(input_data)
    assert result.upi_score == 0.0
    assert result.ranking_tier == "EMERGING"
