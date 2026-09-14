import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole, UserStatus
from app.models.audit_log import AuditLog
from app.models.notification import Notification


@pytest.mark.asyncio
async def test_auth_001_user_registration(client: AsyncClient, db_session: AsyncSession):
    """AUTH-001: Given valid details, When register endpoint called, Then user record created with 201 Created."""
    payload = {
        "full_name": "Rahul Kumar",
        "email": "rahul@example.com",
        "phone": "9876543210",
        "password": "StrongPassword@123",
        "role": "citizen",
        "district": "Ranchi",
        "state": "Jharkhand"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert data["success"] is True
    assert "user_id" in data["data"]
    assert data["data"]["message"] == "Registration successful"

    # Verify database persistence
    stmt = select(User).where(User.email == "rahul@example.com")
    result = await db_session.execute(stmt)
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.full_name == "Rahul Kumar"
    assert user.role == "citizen"
    assert user.status == UserStatus.ACTIVE.value

    # Verify audit log created
    audit_stmt = select(AuditLog).where(AuditLog.user_id == user.id)
    audit_res = await db_session.execute(audit_stmt)
    logs = audit_res.scalars().all()
    assert len(logs) >= 1
    assert logs[0].action == "USER_REGISTERED"


@pytest.mark.asyncio
async def test_auth_002_duplicate_email(client: AsyncClient):
    """AUTH-002: Duplicate Email, Registration rejected with 409 Conflict."""
    payload = {
        "full_name": "Anita Sharma",
        "email": "anita@example.com",
        "password": "StrongPassword@123",
        "role": "faculty"
    }
    # First registration
    res1 = await client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Second registration with same email
    res2 = await client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    data = res2.json()
    assert data["success"] is False
    assert data["error"]["code"] == "CONFLICT"


@pytest.mark.asyncio
async def test_auth_003_invalid_password(client: AsyncClient):
    """AUTH-003: Invalid Password, Registration rejected with 400 Bad Request."""
    payload = {
        "full_name": "Weak Pass User",
        "email": "weak@example.com",
        "password": "simple",  # Fails length & complexity
        "role": "student"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_auth_004_jwt_validation(client: AsyncClient):
    """AUTH-004: Protected endpoint inaccessible without token (401 Unauthorized)."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_login_success_and_profile_retrieval(client: AsyncClient):
    """Test full login, profile access, and refresh token flow."""
    # 1. Register
    reg_payload = {
        "full_name": "Dr. Ramesh Gupta",
        "email": "ramesh@university.ac.in",
        "password": "ProfessorPassword#2026",
        "role": "faculty"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201

    # 2. Login
    login_payload = {
        "email": "ramesh@university.ac.in",
        "password": "ProfessorPassword#2026"
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()["data"]
    
    assert "access_token" in login_data
    assert "refresh_token" in login_data
    assert login_data["role"] == "faculty"
    access_token = login_data["access_token"]
    refresh_token = login_data["refresh_token"]

    # 3. Access Profile with Access Token
    profile_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert profile_res.status_code == 200
    profile_data = profile_res.json()["data"]
    assert profile_data["email"] == "ramesh@university.ac.in"
    assert profile_data["full_name"] == "Dr. Ramesh Gupta"
    assert profile_data["role"] == "faculty"
    assert profile_data["trust_score"] == 50.0

    # 4. Refresh Token
    refresh_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert refresh_res.status_code == 200
    new_access_token = refresh_res.json()["data"]["access_token"]
    assert new_access_token != access_token

    # Verify jti uniqueness and identity preservation
    from app.core import security
    orig_claims = security.decode_token(access_token)
    new_claims = security.decode_token(new_access_token)
    assert orig_claims["jti"] != new_claims["jti"]
    assert orig_claims["sub"] == new_claims["sub"]
    assert new_claims["role"] == "faculty"

    # 5. Access Profile with New Token
    profile_res_2 = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {new_access_token}"}
    )
    assert profile_res_2.status_code == 200


@pytest.mark.asyncio
async def test_logout_revokes_token(client: AsyncClient):
    """Test that logging out revokes the access token."""
    reg_payload = {
        "full_name": "Logout Tester",
        "email": "logout@example.com",
        "password": "SecurePassword!2026",
        "role": "citizen"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "logout@example.com",
        "password": "SecurePassword!2026"
    })
    token = login_res.json()["data"]["access_token"]

    # Call logout
    logout_res = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True

    # Attempting to use the revoked token must fail with 401
    profile_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert profile_res.status_code == 401


@pytest.mark.asyncio
async def test_admin_role_registration(client: AsyncClient):
    """Verify that admin role registration and login work seamlessly."""
    admin_payload = {
        "full_name": "System Administrator",
        "email": "admin@sicp.gov.in",
        "password": "SuperAdminPass@2026",
        "role": "admin"
    }
    reg_res = await client.post("/api/v1/auth/register", json=admin_payload)
    assert reg_res.status_code == 201

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "admin@sicp.gov.in",
        "password": "SuperAdminPass@2026"
    })
    assert login_res.status_code == 200
    assert login_res.json()["data"]["role"] == "admin"


@pytest.mark.asyncio
async def test_change_password(client: AsyncClient):
    """Test password change workflow."""
    reg_payload = {
        "full_name": "Pass Change User",
        "email": "change@example.com",
        "password": "OldPassword@123",
        "role": "student"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "change@example.com",
        "password": "OldPassword@123"
    })
    token = login_res.json()["data"]["access_token"]

    # Change password
    change_res = await client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "current_password": "OldPassword@123",
            "new_password": "BrandNewPassword#2026"
        }
    )
    assert change_res.status_code == 200
    assert change_res.json()["success"] is True

    # Verify old password fails
    fail_login = await client.post("/api/v1/auth/login", json={
        "email": "change@example.com",
        "password": "OldPassword@123"
    })
    assert fail_login.status_code == 401

    # Verify new password succeeds
    success_login = await client.post("/api/v1/auth/login", json={
        "email": "change@example.com",
        "password": "BrandNewPassword#2026"
    })
    assert success_login.status_code == 200
