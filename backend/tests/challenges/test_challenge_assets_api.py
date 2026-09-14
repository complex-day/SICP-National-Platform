import pytest
import io
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.asyncio
async def test_chal_med_001_upload_valid_jpeg(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """CHAL-MED-001: Upload valid JPEG image asset."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Evidence Upload Challenge",
            "description": "Detailed description satisfying all length constraints for challenge creation tests.",
            "category": "Water",
            "affected_population": 200,
            "location": {"lat": 23.57, "lng": 85.51},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]

    fake_jpeg = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00" + b"ImageData" * 50)
    upload_res = await client.post(
        f"/api/v1/challenges/{challenge_id}/assets",
        headers=citizen_auth["headers"],
        files={"file": ("photo.jpg", fake_jpeg, "image/jpeg")},
        data={"media_type": "image"}
    )
    assert upload_res.status_code == 201
    data = upload_res.json()["data"]
    assert "id" in data
    assert "storage_url" in data
    assert data["mime_type"] == "image/jpeg"


@pytest.mark.asyncio
async def test_chal_med_003_upload_valid_pdf(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """CHAL-MED-003: Upload valid PDF document asset."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "PDF Upload Challenge",
            "description": "Detailed description satisfying all length constraints for challenge creation tests.",
            "category": "Healthcare",
            "affected_population": 200,
            "location": {"lat": 23.58, "lng": 85.52},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]

    fake_pdf = io.BytesIO(b"%PDF-1.4\n%...\n" + b"PDF Content" * 50)
    upload_res = await client.post(
        f"/api/v1/challenges/{challenge_id}/assets",
        headers=citizen_auth["headers"],
        files={"file": ("lab_report.pdf", fake_pdf, "application/pdf")},
        data={"media_type": "document"}
    )
    assert upload_res.status_code == 201
    assert upload_res.json()["data"]["mime_type"] == "application/pdf"


@pytest.mark.asyncio
async def test_chal_med_005_reject_executable(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """CHAL-MED-005: Reject executable file upload (.exe)."""
    create_res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Malware Rejection Challenge",
            "description": "Detailed description satisfying all length constraints for challenge creation tests.",
            "category": "Infrastructure",
            "affected_population": 200,
            "location": {"lat": 23.59, "lng": 85.53},
            "status": "draft"
        }
    )
    challenge_id = create_res.json()["data"]["id"]

    fake_exe = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00" + b"MaliciousBinaryPayload")
    upload_res = await client.post(
        f"/api/v1/challenges/{challenge_id}/assets",
        headers=citizen_auth["headers"],
        files={"file": ("malware.exe", fake_exe, "application/x-msdownload")},
        data={"media_type": "document"}
    )
    assert upload_res.status_code in (400, 415)
