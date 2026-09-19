"""Tests for PSICalculator (Project Success Index).

Verifies:
- 6-factor composite formula: 25% completion + 20% on-time + 20% pilot + 15% adoption + 10% review + 10% sustainability.
- Sub-indicator bounds and weights.
- Project status weighting and boundary safety.
"""

import pytest
from app.services.governance_calculators import PSICalculator, PSIInput, PSIResult


def test_psi_high_performance_project():
    """Verify completed project with verified pilot scores high PSI."""
    input_data = PSIInput(
        total_planned_milestones=4,
        approved_milestones=4,  # 100%
        on_time_milestones=4,  # 100%
        pilot_verified=True,  # 100.0
        pilot_active=True,
        target_beneficiaries=1000,
        verified_beneficiaries=1000,  # 100%
        average_faculty_review_score=90.0,  # 90.0
        sustainability_score=85.0,  # 85.0
    )

    result = PSICalculator.calculate(input_data)
    assert isinstance(result, PSIResult)
    assert result.completion_score == 100.0
    assert result.on_time_score == 100.0
    assert result.pilot_score == 100.0
    assert result.adoption_score == 100.0
    assert result.review_score == 90.0
    assert result.sustainability_score == 85.0

    # PSI = 0.25(100) + 0.20(100) + 0.20(100) + 0.15(100) + 0.10(90) + 0.10(85)
    #     = 25 + 20 + 20 + 15 + 9 + 8.5 = 97.5
    assert result.psi_score == 97.5


def test_psi_early_stage_project():
    """Verify newly created proposal with 0 approved milestones scores cleanly."""
    input_data = PSIInput(
        total_planned_milestones=4,
        approved_milestones=0,
        on_time_milestones=0,
        pilot_verified=False,
        pilot_active=False,
        target_beneficiaries=1000,
        verified_beneficiaries=0,
        average_faculty_review_score=0.0,
        sustainability_score=0.0,
    )

    result = PSICalculator.calculate(input_data)
    assert result.psi_score == 0.0
    assert result.completion_score == 0.0
