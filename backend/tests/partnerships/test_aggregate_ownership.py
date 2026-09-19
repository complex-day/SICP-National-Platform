import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_disbursement_and_session_require_valid_parent_agreement(
    client: AsyncClient,
    industry_user: User,
    platform_admin: User,
    innovation_project: InnovationProject,
):
    """Test child disbursements and mentorship sessions cannot exist independently."""
    ind_headers = auth_headers_for(industry_user)

    fake_agreement_id = str(uuid4())

    # Attempt to create disbursement on nonexistent agreement
    disb_res = await client.post(
        f"/api/v1/partnerships/agreements/{fake_agreement_id}/disbursements",
        json={"tranche_number": 1, "amount": 100000.00, "milestone_id": str(uuid4())},
        headers=ind_headers,
    )
    assert disb_res.status_code == 404

    # Attempt to log session on nonexistent agreement
    sess_res = await client.post(
        f"/api/v1/partnerships/agreements/{fake_agreement_id}/sessions",
        json={
            "mentor_user_id": str(industry_user.id),
            "session_date": "2026-10-15T10:00:00Z",
            "duration_hours": 2.0,
            "topics_covered": "Architecture consulting",
        },
        headers=ind_headers,
    )
    assert sess_res.status_code == 404
