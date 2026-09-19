"""Tests for SROICalculator (Social Return on Investment).

Verifies:
- SROI formula precision with NPV discounting over 3-year horizon.
- Deadweight, displacement, and drop-off factors.
- Domain proxy valuation lookups (Water/Agro, Health, CleanTech/Energy).
- Boundary safety: Zero investment baseline ($I = 1.00) prevents division by zero.
"""

import pytest
from app.services.governance_calculators import SROICalculator, SROIInput, SROIResult


def test_sroi_mathematical_precision_and_discounting():
    """Verify exact 3-year NPV calculation and SROI ratio.

    Given:
    - Capital invested = 500,000 INR
    - Beneficiaries = 10,000
    - Annual civic savings = 200,000 INR
    - Domain = "WATER_CONSERVATION" (proxy = 500 INR/beneficiary/year)
    - Deadweight = 0.20, Displacement = 0.05, Drop-off = 0.15, Discount Rate = 0.08
    """
    input_data = SROIInput(
        capital_invested=500000.0,
        beneficiaries_count=10000,
        annual_civic_savings=200000.0,
        domain_category="WATER_CONSERVATION",
        deadweight_rate=0.20,
        displacement_rate=0.05,
        drop_off_rate=0.15,
        discount_rate=0.08,
        time_horizon_years=3,
    )

    result = SROICalculator.calculate(input_data)

    assert isinstance(result, SROIResult)
    assert result.capital_invested == 500000.0
    # Gross annual value = 200,000 + (10,000 * 500) = 5,200,000 INR
    assert result.gross_annual_value == 5200000.0

    # Net year 1 = 5,200,000 * (1 - 0.20) * (1 - 0.05) * (1 - 0.15)^0 = 3,952,000
    # PV year 1 = 3,952,000 / (1 + 0.08)^1 = 3,659,259.26
    # Net year 2 = 5,200,000 * 0.80 * 0.95 * (0.85)^1 = 3,359,200
    # PV year 2 = 3,359,200 / (1.08)^2 = 2,879,972.57
    # Net year 3 = 5,200,000 * 0.80 * 0.95 * (0.85)^2 = 2,855,320
    # PV year 3 = 2,855,320 / (1.08)^3 = 2,266,666.27
    # Total NPV approx = 8,805,898.10
    # SROI Ratio = 8,805,898.10 / 500,000 = 17.61
    assert result.net_present_value > 8800000.0
    assert result.sroi_ratio > 17.0
    assert round(result.sroi_ratio, 2) == 17.61


def test_sroi_zero_investment_boundary_safety():
    """Verify zero or negative capital investment safely uses baseline 1.00."""
    input_data = SROIInput(
        capital_invested=0.0,
        beneficiaries_count=500,
        annual_civic_savings=50000.0,
        domain_category="HEALTHCARE",
    )

    result = SROICalculator.calculate(input_data)
    assert result.capital_invested == 1.0
    assert result.sroi_ratio > 0.0
    assert not float("inf") == result.sroi_ratio
    assert not float("nan") == result.sroi_ratio


def test_sroi_domain_proxies():
    """Verify domain proxy valuations defaults."""
    assert SROICalculator.get_domain_proxy_value("WATER_CONSERVATION") == 500.0
    assert SROICalculator.get_domain_proxy_value("HEALTHCARE") == 1200.0
    assert SROICalculator.get_domain_proxy_value("CLEANTECH_ENERGY") == 800.0
    assert SROICalculator.get_domain_proxy_value("AGRICULTURE") == 500.0
    assert SROICalculator.get_domain_proxy_value("UNKNOWN_CATEGORY") == 400.0
