"""Tests for SRICalculator (Sponsor Reliability Index).

Verifies:
- 4-factor composite formula: 40% fulfillment + 30% timeliness + 20% retention + 10% mentorship.
- Tier classifications: PLATINUM (>=90), GOLD (>=80), SILVER (>=65), AT_RISK (>=50), DELINQUENT (<50).
- Penalty upon agreement withdrawal.
- Edge case: 0 promised amounts or 0 agreements defaults safely to 100% or 0% as appropriate.
"""

import pytest
from app.services.governance_calculators import SRICalculator, SRIInput, SRIResult


def test_sri_platinum_calculation():
    """Verify high-performing sponsor scores PLATINUM tier."""
    input_data = SRIInput(
        total_promised_funds=1000000.0,
        total_released_funds=1000000.0,
        total_scheduled_tranches=4,
        on_time_tranches=4,
        total_executed_agreements=5,
        withdrawn_agreements=0,
        promised_mentorship_hours=20.0,
        completed_mentorship_hours=20.0,
    )

    result = SRICalculator.calculate(input_data)
    assert isinstance(result, SRIResult)
    assert result.fulfillment_score == 100.0
    assert result.timeliness_score == 100.0
    assert result.retention_score == 100.0
    assert result.mentorship_score == 100.0
    assert result.sri_score == 100.0
    assert result.reliability_tier == "PLATINUM"


def test_sri_at_risk_and_withdrawal_penalty():
    """Verify sponsor with low fulfillment and a withdrawal receives low tier."""
    input_data = SRIInput(
        total_promised_funds=2000000.0,
        total_released_funds=500000.0,  # 25% fulfillment
        total_scheduled_tranches=4,
        on_time_tranches=2,  # 50% timeliness
        total_executed_agreements=2,
        withdrawn_agreements=1,  # 50% withdrawal rate => 50% retention
        promised_mentorship_hours=10.0,
        completed_mentorship_hours=0.0,  # 0% mentorship
    )

    result = SRICalculator.calculate(input_data)
    # SRI = 0.40(25) + 0.30(50) + 0.20(50) + 0.10(0) = 10 + 15 + 10 + 0 = 35.0
    assert result.fulfillment_score == 25.0
    assert result.timeliness_score == 50.0
    assert result.retention_score == 50.0
    assert result.mentorship_score == 0.0
    assert result.sri_score == 35.0
    assert result.reliability_tier == "DELINQUENT"


def test_sri_zero_promised_edge_case():
    """Verify zero promised funds / hours defaults safely without division by zero."""
    input_data = SRIInput(
        total_promised_funds=0.0,
        total_released_funds=0.0,
        total_scheduled_tranches=0,
        on_time_tranches=0,
        total_executed_agreements=0,
        withdrawn_agreements=0,
        promised_mentorship_hours=0.0,
        completed_mentorship_hours=0.0,
    )

    result = SRICalculator.calculate(input_data)
    assert result.sri_score == 100.0
    assert result.reliability_tier == "PLATINUM"
