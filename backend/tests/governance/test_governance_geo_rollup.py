"""Tests for Geographic Aggregations & Boundary Edge Cases (Module 7)."""

import pytest
from app.services.governance_service import GovernanceService
from app.models.challenge import Challenge
from uuid import uuid4


@pytest.mark.asyncio
async def test_district_to_state_sum_conservation(db_session, full_governance_seed, citizen_user):
    """Verify sum of constituent districts strictly equals state total."""
    # Add a second district in Maharashtra ("Pune")
    pune_chal = Challenge(
        id=uuid4(),
        title="Urban Traffic & Air Quality Sensor Grid",
        description="Air quality IoT nodes across Pune intersections.",
        category="CLEANTECH_ENERGY",
        citizen_id=citizen_user.id,
        created_by=citizen_user.id,
        status="resolved",
        visibility="public",
        district="Pune",
        state="Maharashtra",
        latitude=18.5204,
        longitude=73.8567,
        affected_population=25000,
        version=1,
    )
    db_session.add(pune_chal)
    await db_session.commit()

    service = GovernanceService(db_session)
    state_heatmap = await service.get_state_heatmap("Maharashtra")

    # Verify conservation
    total_chal_sum = sum(d.total_challenges for d in state_heatmap.districts)
    total_ben_sum = sum(d.total_beneficiaries for d in state_heatmap.districts)

    assert state_heatmap.total_challenges == total_chal_sum
    assert state_heatmap.total_beneficiaries == total_ben_sum
    assert state_heatmap.total_districts == len(state_heatmap.districts)


@pytest.mark.asyncio
async def test_beneficiary_deduplication(db_session, full_governance_seed):
    """Verify deduplication of beneficiaries for multiple milestones on the same challenge."""
    service = GovernanceService(db_session)
    card = await service.get_district_scorecard("Wardha")

    # Total beneficiaries should equal the challenge's affected population (15,000)
    assert card.total_beneficiaries == 15000
