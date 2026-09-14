import pytest
import io
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from app.models.audit_log import AuditLog
from app.core.constants import AuditAction


@pytest.mark.asyncio
async def test_audit_001_challenge_creation(
    client: AsyncClient, db_session: AsyncSession, citizen_auth: Dict[str, Any]
):
    """AUDIT-001: Verification of CHALLENGE_CREATED audit log."""
    res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Severe Soil Salinity in Paddy Fields",
            "description": "Rising salinity levels reducing agricultural crop yield across 50 hectares of arable land.",
            "category": "Agriculture",
            "affected_population": 600,
            "location": {"lat": 23.43, "lng": 85.39}
        }
    )
    challenge_id = res.json()["data"]["id"]

    stmt = select(AuditLog).where(
        AuditLog.entity_id == challenge_id,
        AuditLog.action == AuditAction.CHALLENGE_CREATED.value
    )
    result = await db_session.execute(stmt)
    log = result.scalar_one_or_none()
    assert log is not None
    assert str(log.user_id) == citizen_auth["user_id"]


@pytest.mark.asyncio
async def test_audit_002_challenge_updated(
    client: AsyncClient, db_session: AsyncSession, citizen_auth: Dict[str, Any]
):
    """AUDIT-002: Verification of CHALLENGE_UPDATED audit log."""
    res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Soil Salinity Test Challenge",
            "description": "Rising salinity levels reducing agricultural crop yield across 50 hectares of arable land.",
            "category": "Agriculture",
            "affected_population": 600,
            "location": {"lat": 23.43, "lng": 85.39},
            "status": "draft"
        }
    )
    challenge_id = res.json()["data"]["id"]
    v1 = res.json()["data"]["version"]

    await client.patch(
        f"/api/v1/challenges/{challenge_id}",
        headers=citizen_auth["headers"],
        json={"title": "Updated Soil Salinity Title Description", "version": v1}
    )

    stmt = select(AuditLog).where(
        AuditLog.entity_id == challenge_id,
        AuditLog.action == AuditAction.CHALLENGE_UPDATED.value
    )
    result = await db_session.execute(stmt)
    log = result.scalar_one_or_none()
    assert log is not None


@pytest.mark.asyncio
async def test_audit_003_status_changed(
    client: AsyncClient, db_session: AsyncSession, citizen_auth: Dict[str, Any]
):
    """AUDIT-003: Verification of STATUS_CHANGED audit log."""
    res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Status Transition Audit Test",
            "description": "Detailed description satisfying all length constraints for challenge creation tests.",
            "category": "Water",
            "affected_population": 350,
            "location": {"lat": 23.44, "lng": 85.40},
            "status": "draft"
        }
    )
    challenge_id = res.json()["data"]["id"]
    v1 = res.json()["data"]["version"]

    await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=citizen_auth["headers"],
        json={"status": "submitted", "version": v1, "reason": "Ready for formal review"}
    )

    stmt = select(AuditLog).where(
        AuditLog.entity_id == challenge_id,
        AuditLog.action == AuditAction.STATUS_CHANGED.value
    )
    result = await db_session.execute(stmt)
    log = result.scalar_one_or_none()
    assert log is not None


@pytest.mark.asyncio
async def test_audit_004_asset_uploaded(
    client: AsyncClient, db_session: AsyncSession, citizen_auth: Dict[str, Any]
):
    """AUDIT-004: Verification of ASSET_UPLOADED audit log."""
    res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Asset Upload Audit Test",
            "description": "Detailed description satisfying all length constraints for challenge creation tests.",
            "category": "Environment",
            "affected_population": 350,
            "location": {"lat": 23.44, "lng": 85.40},
            "status": "draft"
        }
    )
    challenge_id = res.json()["data"]["id"]

    fake_image = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00" + b"A" * 500)
    upload_res = await client.post(
        f"/api/v1/challenges/{challenge_id}/assets",
        headers=citizen_auth["headers"],
        files={"file": ("evidence.jpg", fake_image, "image/jpeg")},
        data={"media_type": "image"}
    )
    assert upload_res.status_code == 201
    asset_id = upload_res.json()["data"]["id"]

    stmt = select(AuditLog).where(
        AuditLog.entity_id == asset_id,
        AuditLog.action == AuditAction.ASSET_UPLOADED.value
    )
    result = await db_session.execute(stmt)
    log = result.scalar_one_or_none()
    assert log is not None


@pytest.mark.asyncio
async def test_audit_005_challenge_archived(
    client: AsyncClient, db_session: AsyncSession, citizen_auth: Dict[str, Any]
):
    """AUDIT-005: Verification of CHALLENGE_ARCHIVED audit log."""
    res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Challenge Archival Audit Test",
            "description": "Detailed description satisfying all length constraints for challenge creation tests.",
            "category": "Energy",
            "affected_population": 120,
            "location": {"lat": 23.45, "lng": 85.41},
            "status": "draft"
        }
    )
    challenge_id = res.json()["data"]["id"]
    v1 = res.json()["data"]["version"]

    await client.patch(
        f"/api/v1/challenges/{challenge_id}/status",
        headers=citizen_auth["headers"],
        json={"status": "archived", "version": v1}
    )

    stmt = select(AuditLog).where(
        AuditLog.entity_id == challenge_id,
        AuditLog.action == AuditAction.CHALLENGE_ARCHIVED.value
    )
    result = await db_session.execute(stmt)
    log = result.scalar_one_or_none()
    assert log is not None


@pytest.mark.asyncio
async def test_audit_006_visibility_changed(
    client: AsyncClient, db_session: AsyncSession, citizen_auth: Dict[str, Any]
):
    """AUDIT-006: Verification of VISIBILITY_CHANGED audit log."""
    res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Visibility Change Audit Test",
            "description": "Detailed description satisfying all length constraints for challenge creation tests.",
            "category": "Accessibility",
            "affected_population": 90,
            "location": {"lat": 23.46, "lng": 85.42},
            "status": "draft",
            "visibility": "PUBLIC"
        }
    )
    challenge_id = res.json()["data"]["id"]
    v1 = res.json()["data"]["version"]

    await client.patch(
        f"/api/v1/challenges/{challenge_id}",
        headers=citizen_auth["headers"],
        json={"visibility": "PRIVATE", "version": v1}
    )

    stmt = select(AuditLog).where(
        AuditLog.entity_id == challenge_id,
        AuditLog.action == AuditAction.VISIBILITY_CHANGED.value
    )
    result = await db_session.execute(stmt)
    log = result.scalar_one_or_none()
    assert log is not None
