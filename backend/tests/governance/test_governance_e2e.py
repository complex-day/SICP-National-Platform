"""End-to-End Test for Full Platform Macro-Governance Intelligence Lifecycle."""

import pytest
from httpx import AsyncClient
from tests.governance.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_full_governance_lifecycle_e2e(
    client: AsyncClient,
    full_governance_seed: dict,
    platform_admin,
    government_user,
    industry_user,
    faculty_user,
):
    """End-to-end test verifying full macro-governance intelligence:

    1. Recalculate all snapshots as platform admin.
    2. Government queries district scorecard for Wardha & state heatmap for Maharashtra.
    3. Industry queries Sponsor Reliability Index & exports MCA CSR-1 report.
    4. Faculty queries University Performance Index & exports NAAC/NIRF report.
    5. Citizen/Public queries unauthenticated open data transparency ledger.
    """
    admin_headers = auth_headers_for(platform_admin)
    gov_headers = auth_headers_for(government_user)
    ind_headers = auth_headers_for(industry_user)
    fac_headers = auth_headers_for(faculty_user)

    # Step 1: Admin Materializes Snapshots
    resp_snap = await client.post("/api/v1/governance/snapshots/recalculate", json={"recalculate_all": True}, headers=admin_headers)
    assert resp_snap.status_code == 200
    assert resp_snap.json()["data"]["recalculated"] is True

    # Step 2: Government Telemetry
    resp_dist = await client.get("/api/v1/governance/districts/Wardha", headers=gov_headers)
    assert resp_dist.status_code == 200
    dist_data = resp_dist.json()["data"]
    assert dist_data["district"] == "Wardha"
    assert dist_data["resolved_challenges"] >= 1
    assert dist_data["total_beneficiaries"] >= 15000

    resp_state = await client.get("/api/v1/governance/states/Maharashtra", headers=gov_headers)
    assert resp_state.status_code == 200
    assert resp_state.json()["data"]["total_beneficiaries"] >= 15000

    # Step 3: Industry CSR & SRI
    partner_id = full_governance_seed["partner"].id
    resp_sri = await client.get(f"/api/v1/governance/sponsors/reliability/{partner_id}", headers=ind_headers)
    assert resp_sri.status_code == 200
    assert resp_sri.json()["data"]["sri_score"] >= 80.0

    resp_csr = await client.get(f"/api/v1/governance/reports/mca-csr/{partner_id}", headers=ind_headers)
    assert resp_csr.status_code == 200
    assert resp_csr.json()["data"]["total_released_funds_inr"] == 500000.0

    # Step 4: University Research Translation & UPI
    univ_id = full_governance_seed["university"].id
    resp_upi = await client.get(f"/api/v1/governance/universities/performance/{univ_id}", headers=fac_headers)
    assert resp_upi.status_code == 200
    assert resp_upi.json()["data"]["upi_score"] > 0.0

    resp_naac = await client.get(f"/api/v1/governance/reports/naac-nirf/{univ_id}", headers=fac_headers)
    assert resp_naac.status_code == 200
    assert len(resp_naac.json()["data"]["innovation_evidence_records"]) == 3

    # Step 5: Public Transparency Open Data
    resp_pub = await client.get("/api/v1/governance/public/transparency")
    assert resp_pub.status_code == 200
    pub_data = resp_pub.json()["data"]
    assert len(pub_data["sha256_digest"]) == 64
    assert pub_data["total_challenges_resolved"] >= 1
    assert pub_data["total_verified_beneficiaries"] >= 15000
