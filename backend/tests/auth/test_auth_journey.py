import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserStatus
from app.models.audit_log import AuditLog


@pytest.mark.asyncio
async def test_complete_authentication_journey(client: AsyncClient, db_session: AsyncSession):
    """End-to-End Integration Journey Test:
    Step 1: Register User (Citizen)
    Step 2: Login to acquire Access + Refresh tokens
    Step 3: Refresh Access Token with valid Refresh Token
    Step 4: Retrieve authenticated Profile (/me) using new token
    Step 5: Logout (Revoke tokens)
    Step 6: Verify revoked token is rejected with 401 Unauthorized
    """
    # -------------------------------------------------------------
    # Step 1: Register User
    # -------------------------------------------------------------
    register_payload = {
        "full_name": "Vikram Seth",
        "email": "vikram.seth@example.com",
        "phone": "9811223344",
        "password": "JourneyPassword@2026",
        "role": "citizen",
        "district": "Dhanbad",
        "state": "Jharkhand"
    }
    reg_response = await client.post("/api/v1/auth/register", json=register_payload)
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert reg_data["success"] is True
    user_id = reg_data["data"]["user_id"]
    assert user_id is not None

    # -------------------------------------------------------------
    # Step 2: Login to acquire Access + Refresh tokens
    # -------------------------------------------------------------
    login_payload = {
        "email": "vikram.seth@example.com",
        "password": "JourneyPassword@2026"
    }
    login_response = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["success"] is True
    
    tokens = login_data["data"]
    access_token_1 = tokens["access_token"]
    refresh_token_1 = tokens["refresh_token"]
    assert tokens["role"] == "citizen"
    assert tokens["user_id"] == user_id

    # -------------------------------------------------------------
    # Step 3: Refresh Access Token
    # -------------------------------------------------------------
    refresh_response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token_1}
    )
    assert refresh_response.status_code == 200
    refresh_data = refresh_response.json()
    assert refresh_data["success"] is True
    access_token_2 = refresh_data["data"]["access_token"]
    assert access_token_2 != access_token_1

    # Verify jti uniqueness and identity match
    from app.core import security
    claims_1 = security.decode_token(access_token_1)
    claims_2 = security.decode_token(access_token_2)
    assert claims_1["jti"] != claims_2["jti"]
    assert claims_1["sub"] == claims_2["sub"]
    assert claims_2["role"] == "citizen"

    # -------------------------------------------------------------
    # Step 4: Retrieve authenticated Profile (/me) using new token
    # -------------------------------------------------------------
    me_response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token_2}"}
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["success"] is True
    assert me_data["data"]["email"] == "vikram.seth@example.com"
    assert me_data["data"]["full_name"] == "Vikram Seth"
    assert me_data["data"]["role"] == "citizen"
    assert me_data["data"]["status"] == UserStatus.ACTIVE.value

    # -------------------------------------------------------------
    # Step 5: Logout (Revoke tokens)
    # -------------------------------------------------------------
    logout_response = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {access_token_2}"},
        json={"refresh_token": refresh_token_1}
    )
    assert logout_response.status_code == 200
    logout_data = logout_response.json()
    assert logout_data["success"] is True

    # -------------------------------------------------------------
    # Step 6: Verify revoked tokens are rejected with 401 Unauthorized
    # -------------------------------------------------------------
    blocked_me_response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token_2}"}
    )
    assert blocked_me_response.status_code == 401
    assert blocked_me_response.json()["success"] is False
    assert blocked_me_response.json()["error"]["code"] == "UNAUTHORIZED"

    # Verify audit logs captured every phase
    audit_stmt = select(AuditLog).where(AuditLog.user_id == user_id)
    audit_res = await db_session.execute(audit_stmt)
    logs = audit_res.scalars().all()
    actions = [log.action for log in logs]
    assert "USER_REGISTERED" in actions
    assert "LOGIN_SUCCESS" in actions
    assert "USER_LOGOUT" in actions
