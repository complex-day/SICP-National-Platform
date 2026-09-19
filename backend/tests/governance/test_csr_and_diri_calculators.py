"""Tests for CSRUtilizationEngine and DIRICalculator."""

import pytest
from app.services.governance_calculators import (
    CSRUtilizationEngine,
    CSRUtilizationInput,
    CSRUtilizationResult,
    DIRICalculator,
    DIRIInput,
    DIRIResult,
)


def test_csr_utilization_breakdown():
    input_data = CSRUtilizationInput(
        committed_funds=2000000.0,
        approved_funds=1500000.0,
        released_funds=1000000.0,
        utilized_funds=600000.0,
        verified_beneficiaries=3000,
        gross_economic_value_created=3000000.0,
    )

    result = CSRUtilizationEngine.calculate(input_data)
    assert isinstance(result, CSRUtilizationResult)
    assert result.committed_funds == 2000000.0
    assert result.approved_funds == 1500000.0
    assert result.released_funds == 1000000.0
    assert result.utilized_funds == 600000.0
    assert result.unutilized_funds == 400000.0
    assert result.utilization_percentage == 60.0
    assert result.cost_per_beneficiary == 200.0
    assert result.funding_efficiency_ratio == 5.0


def test_diri_district_calculation():
    input_data = DIRIInput(
        total_challenges=10,
        resolved_challenges=8,  # 80%
        active_teams=10,
        population=100000,  # 10 teams per 100k => 100% density
        sponsored_projects=5,
        total_projects=10,  # 50% sponsorship
        deployed_pilots=4,  # 40% pilot ratio
    )

    result = DIRICalculator.calculate(input_data)
    assert isinstance(result, DIRIResult)
    assert result.resolution_rate == 80.0
    assert result.team_density_score == 100.0
    assert result.sponsorship_coverage == 50.0
    assert result.pilot_ratio == 40.0

    # DIRI = 0.40(80) + 0.30(100) + 0.20(50) + 0.10(40)
    #      = 32 + 30 + 10 + 4 = 76.0
    assert result.diri_score == 76.0
