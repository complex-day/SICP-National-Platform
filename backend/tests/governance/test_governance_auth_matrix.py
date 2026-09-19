"""Tests for Governance Role-Based Access Control (RBAC) Matrix."""

import pytest
from httpx import AsyncClient
from tests.governance.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_funnel_access_rbac(client: AsyncClient, full_governance_seed: dict, government_user, student_user, platform_admin):
    """Verify only government and admin can access internal pipeline funnel velocity."""
    # 1. Government user allowed
    resp_gov = await client.get("/api/v1/governance/funnel", headers=auth_headers_for(government_user))
    assert resp_gov.status_code == 200

    # 2. Admin user allowed
    resp_adm = await client.get("/api/v1/governance/funnel", headers=auth_headers_for(platform_admin))
    assert resp_adm.status_code == 200

    # 3. Student user forbidden
    resp_stu = await client.get("/api/v1/governance/funnel", headers=auth_headers_for(student_user))
    assert resp_stu.status_code == 403


@pytest.mark.asyncio
async def test_snapshot_recalculation_admin_only(client: AsyncClient, full_governance_seed: dict, government_user, platform_admin):
    """Verify only admin can trigger snapshot recalculation."""
    # 1. Admin allowed
    resp_adm = await client.post("/api/v1/governance/snapshots/recalculate", json={"recalculate_all": True}, headers=auth_headers_for(platform_admin))
    assert resp_adm.status_code == 200

    # 2. Government forbidden
    resp_gov = await client.post("/api/v1/governance/snapshots/recalculate", json={"recalculate_all": True}, headers=auth_headers_for(government_user))
    assert resp_gov.status_code == 403


@pytest.mark.asyncio
async def test_mca_csr_report_rbac(client: AsyncClient, full_governance_seed: dict, industry_user, student_user):
    """Verify student cannot access confidential corporate MCA CSR compliance reports."""
    partner_id = full_governance_seed["partner"].id

    # 1. Industry user allowed
    resp_ind = await client.get(f"/api/v1/governance/reports/mca-csr/{partner_id}", headers=auth_headers_for(industry_user))
    assert resp_ind.status_code == 200

    # 2. Student forbidden
    resp_stu = await client.get(f"/api/v1/governance/reports/mca-csr/{partner_id}", headers=auth_headers_for(student_user))
    assert resp_stu.status_code == 403
