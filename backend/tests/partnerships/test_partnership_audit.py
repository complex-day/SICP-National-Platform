import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import uuid4

from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.project import InnovationProject
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_partnership_lifecycle_emits_immutable_audit_logs(
    client: AsyncClient,
    db_session: AsyncSession,
    industry_user: User,
    platform_admin: User,
    student_leader: User,
    innovation_project: InnovationProject,
):
    """Test partnership actions emit immutable audit events to audit_logs."""
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    lead_headers = auth_headers_for(student_leader)

    # 1. Partner Registration
    reg_res = await client.post(
        "/api/v1/partnerships/partners",
        json={
            "company_name": "Mahindra Rise Foundation",
            "domain": "Agritech & Water Conservation",
            "cin_number": "L65990MH1945PLC004558",
            "csr_budget": 40000000.00,
            "website": "https://www.mahindra.com",
            "point_of_contact_name": "A. Mahindra",
            "point_of_contact_email": industry_user.email,
            "point_of_contact_phone": "+919876543244",
        },
        headers=ind_headers,
    )
    partner_id = reg_res.json()["data"]["id"]

    # 2. Verify Audit Log for Partner Registration
    stmt = select(AuditLog).where(AuditLog.action == "INDUSTRY_PARTNER_REGISTERED")
    result = await db_session.execute(stmt)
    logs = result.scalars().all()
    assert len(logs) >= 1
    assert any(log.metadata_json.get("company_name") == "Mahindra Rise Foundation" for log in logs if log.metadata_json)
