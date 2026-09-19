"""Integration tests for Governance & Impact Intelligence REST Endpoints."""

import pytest
from httpx import AsyncClient
from tests.governance.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_public_transparency_endpoint_unauthenticated(client: AsyncClient, full_governance_seed: dict):
    """Verify public endpoint is accessible without authorization header and returns SHA-256 digest."""
    resp = await client.get("/api/v1/governance/public/transparency")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    payload = data["data"]
    assert "sha256_digest" in payload
    assert len(payload["sha256_digest"]) == 64
    assert payload["total_challenges_submitted"] >= 1
    assert payload["total_verified_beneficiaries"] >= 15000
    # Zero citizen email/phone in public payload
    assert "email" not in str(payload)
    assert "phone" not in str(payload)


@pytest.mark.asyncio
async def test_national_overview_endpoint(client: AsyncClient, full_governance_seed: dict, government_user):
    """Verify national overview endpoint returns macro telemetry."""
    headers = auth_headers_for(government_user)
    resp = await client.get("/api/v1/governance/overview", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    payload = data["data"]
    assert payload["total_challenges"] >= 1
    assert payload["macro_sroi_ratio"] > 0.0


@pytest.mark.asyncio
async def test_district_scorecard_and_state_heatmap(client: AsyncClient, full_governance_seed: dict, government_user):
    """Verify district telemetry and state aggregation."""
    headers = auth_headers_for(government_user)

    # 1. District scorecard for Wardha
    resp_dist = await client.get("/api/v1/governance/districts/Wardha", headers=headers)
    assert resp_dist.status_code == 200
    dist_data = resp_dist.json()["data"]
    assert dist_data["district"] == "Wardha"
    assert dist_data["resolved_challenges"] >= 1
    assert dist_data["total_beneficiaries"] >= 15000
    assert dist_data["district_innovation_index"] > 0.0

    # 2. State heatmap for Maharashtra
    resp_state = await client.get("/api/v1/governance/states/Maharashtra", headers=headers)
    assert resp_state.status_code == 200
    state_data = resp_state.json()["data"]
    assert state_data["state"] == "Maharashtra"
    assert len(state_data["districts"]) >= 1


@pytest.mark.asyncio
async def test_project_sroi_endpoint(client: AsyncClient, full_governance_seed: dict, student_user):
    """Verify project-specific SROI computation endpoint."""
    headers = auth_headers_for(student_user)
    proj_id = full_governance_seed["project"].id

    resp = await client.get(f"/api/v1/governance/sroi/{proj_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["project_id"] == str(proj_id)
    assert data["capital_invested_inr"] == 500000.0
    assert data["sroi_ratio"] > 1.0
    assert data["psi_score"] > 80.0


@pytest.mark.asyncio
async def test_sponsor_reliability_index_catalog(client: AsyncClient, full_governance_seed: dict, industry_user):
    """Verify sponsor reliability SRI endpoint."""
    headers = auth_headers_for(industry_user)
    partner_id = full_governance_seed["partner"].id

    resp = await client.get("/api/v1/governance/sponsors/reliability", headers=headers)
    assert resp.status_code == 200
    sponsors = resp.json()["data"]
    assert len(sponsors) >= 1

    # Single sponsor detail
    resp_single = await client.get(f"/api/v1/governance/sponsors/reliability/{partner_id}", headers=headers)
    assert resp_single.status_code == 200
    sri_data = resp_single.json()["data"]
    assert sri_data["partner_id"] == str(partner_id)
    assert sri_data["sri_score"] >= 80.0
    assert sri_data["reliability_tier"] in ["PLATINUM", "GOLD"]


@pytest.mark.asyncio
async def test_university_performance_index_catalog(client: AsyncClient, full_governance_seed: dict, faculty_user):
    """Verify university UPI endpoint."""
    headers = auth_headers_for(faculty_user)
    univ_id = full_governance_seed["university"].id

    resp = await client.get("/api/v1/governance/universities/performance", headers=headers)
    assert resp.status_code == 200
    univs = resp.json()["data"]
    assert len(univs) >= 1

    # Single university detail
    resp_single = await client.get(f"/api/v1/governance/universities/performance/{univ_id}", headers=headers)
    assert resp_single.status_code == 200
    upi_data = resp_single.json()["data"]
    assert upi_data["university_id"] == str(univ_id)
    assert upi_data["upi_score"] > 0.0


@pytest.mark.asyncio
async def test_pipeline_conversion_funnel(client: AsyncClient, full_governance_seed: dict, government_user):
    """Verify 7-stage innovation funnel endpoint."""
    headers = auth_headers_for(government_user)
    resp = await client.get("/api/v1/governance/funnel", headers=headers)
    assert resp.status_code == 200
    funnel = resp.json()["data"]
    assert len(funnel["stages"]) == 7
    assert funnel["total_challenges_initiated"] >= 1


@pytest.mark.asyncio
async def test_mca_csr1_and_naac_reports(client: AsyncClient, full_governance_seed: dict, industry_user, faculty_user):
    """Verify compliance reports export."""
    partner_id = full_governance_seed["partner"].id
    univ_id = full_governance_seed["university"].id

    # 1. MCA CSR-1
    resp_mca = await client.get(f"/api/v1/governance/reports/mca-csr/{partner_id}", headers=auth_headers_for(industry_user))
    assert resp_mca.status_code == 200
    mca_data = resp_mca.json()["data"]
    assert mca_data["partner_id"] == str(partner_id)
    assert "Section 135" in mca_data["mca_section_135_declaration"]
    assert mca_data["total_released_funds_inr"] == 500000.0

    # 2. NAAC/NIRF
    resp_naac = await client.get(f"/api/v1/governance/reports/naac-nirf/{univ_id}", headers=auth_headers_for(faculty_user))
    assert resp_naac.status_code == 200
    naac_data = resp_naac.json()["data"]
    assert naac_data["university_id"] == str(univ_id)
    assert len(naac_data["innovation_evidence_records"]) == 3


@pytest.mark.asyncio
async def test_admin_snapshot_recalculation(client: AsyncClient, full_governance_seed: dict, platform_admin):
    """Verify admin recalculate trigger persists snapshots."""
    headers = auth_headers_for(platform_admin)
    resp = await client.post("/api/v1/governance/snapshots/recalculate", json={"recalculate_all": True}, headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["recalculated"] is True
    assert data["districts_updated_count"] >= 1
