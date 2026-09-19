import pytest
from httpx import AsyncClient
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject, ProjectMilestone
from tests.partnerships.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_full_partnership_lifecycle_e2e(
    client: AsyncClient,
    platform_admin: User,
    faculty_user: User,
    student_leader: User,
    industry_user: User,
    corporate_mentor: User,
    active_m5_project: InnovationProject,
    approved_milestone: ProjectMilestone,
):
    """
    Complete End-to-End M6 Lifecycle Test:
    Registration -> Accreditation -> Multi-dimensional Agreement Creation ->
    Submission -> Faculty Approval -> Tranche Scheduling & Release ->
    Mentorship Logging & Attendance Verification -> Equipment Delivery & Verification ->
    Pilot Deployment & Evidence Confirmation -> Full Fulfillment -> Audit Trail Validation.
    """
    ind_headers = auth_headers_for(industry_user)
    admin_headers = auth_headers_for(platform_admin)
    faculty_headers = auth_headers_for(faculty_user)
    student_headers = auth_headers_for(student_leader)
    mentor_headers = auth_headers_for(corporate_mentor)

    # 1. Partner Registration
    reg_payload = {
        "company_name": "Bharat Heavy Electricals & Electronics Ltd",
        "domain": "CleanTech & Industrial Automation",
        "cin_number": "L74899DL1964GOI004281",
        "csr_budget": 25000000.00,
        "website": "https://www.bhel-csr.gov.in",
        "point_of_contact_name": "Dr. Sunil Narang",
        "point_of_contact_email": industry_user.email,
        "point_of_contact_phone": "+919811223344",
    }
    reg_res = await client.post("/api/v1/partnerships/partners", json=reg_payload, headers=ind_headers)
    assert reg_res.status_code == 201, reg_res.text
    partner_id = reg_res.json()["data"]["id"]

    # 2. Admin Verification
    ver_res = await client.patch(
        f"/api/v1/partnerships/partners/{partner_id}/verify",
        json={"status": "VERIFIED", "verification_notes": "MCA and PSU accreditation verified."},
        headers=admin_headers,
    )
    assert ver_res.status_code == 200
    assert ver_res.json()["data"]["verification_status"] == "VERIFIED"

    # 3. Create Multi-Dimensional Partnership Agreement (DRAFT)
    agree_payload = {
        "partner_id": partner_id,
        "project_id": str(active_m5_project.id),
        "partnership_type": "CSR_GRANT",
        "promised_amount": 1000000.00,
        "promised_hours": 50,
        "equipment_description": "5 Industrial LoRaWAN Gateways and 20 Soil Probes",
        "equipment_quantity": 25,
        "pilot_support_description": "Field Deployment Testbed at Chakan Industrial Agro Corridor",
        "terms_and_conditions": "Comprehensive CSR & R&D acceleration collaboration.",
    }
    create_res = await client.post("/api/v1/partnerships/agreements", json=agree_payload, headers=ind_headers)
    assert create_res.status_code == 201, create_res.text
    agreement_id = create_res.json()["data"]["id"]
    assert create_res.json()["data"]["status"] in ("DRAFT", "PROPOSED")

    # 4. Submit Agreement
    sub_res = await client.post(f"/api/v1/partnerships/agreements/{agreement_id}/submit", headers=ind_headers)
    assert sub_res.status_code == 200
    assert sub_res.json()["data"]["status"] == "SUBMITTED"

    # 5. Supervising Faculty Approves Agreement
    app_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/approve",
        json={"approval_notes": "Approved by IIT Bombay PI Dr. Arvind Sharma."},
        headers=faculty_headers,
    )
    assert app_res.status_code == 200
    assert app_res.json()["data"]["status"] == "APPROVED"

    # 6. Schedule Milestone-Linked Tranche 1 (₹4,00,000)
    t1_payload = {
        "milestone_id": str(approved_milestone.id),
        "tranche_number": 1,
        "amount": 400000.00,
        "due_date": "2026-10-15",
    }
    t1_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/disbursements",
        json=t1_payload,
        headers=ind_headers,
    )
    assert t1_res.status_code == 201
    d1_id = t1_res.json()["data"]["id"]

    # 7. Release Tranche 1 Funds
    rel_res = await client.post(
        f"/api/v1/partnerships/disbursements/{d1_id}/release",
        json={"transaction_reference": "NEFT/BHEL/20260919/00918"},
        headers=ind_headers,
    )
    assert rel_res.status_code == 200
    assert rel_res.json()["data"]["status"] == "RELEASED"

    # 8. Log Corporate Mentorship Session
    sess_payload = {
        "mentor_id": str(corporate_mentor.id),
        "session_date": "2026-09-18T14:30:00Z",
        "duration_hours": 3.5,
        "topic": "Edge Sensor Calibration & Industrial Noise Reduction",
        "summary": "Reviewed IoT circuit diagram, debugged ADC jitter.",
    }
    sess_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/mentorship-sessions",
        json=sess_payload,
        headers=mentor_headers,
    )
    assert sess_res.status_code == 201
    sess_id = sess_res.json()["data"]["id"]

    # Student verifies mentorship attendance & gives optional 5-star rating
    ver_sess_res = await client.post(
        f"/api/v1/partnerships/mentorship-sessions/{sess_id}/verify",
        json={"attended": True, "student_rating": 5, "feedback": "Extremely valuable technical guidance!"},
        headers=student_headers,
    )
    assert ver_sess_res.status_code == 200
    assert ver_sess_res.json()["data"]["status"] == "VERIFIED"

    # 9. Deliver Equipment Manifest
    eq_payload = {
        "delivered_quantity": 25,
        "delivery_manifest_url": "https://storage.sicp.gov.in/manifests/bhel_gateways_2026.pdf",
        "manifest_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "delivery_notes": "Delivered to IIT Bombay Embedded Systems Lab",
    }
    eq_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/equipment-delivery",
        json=eq_payload,
        headers=ind_headers,
    )
    assert eq_res.status_code == 200
    assert eq_res.json()["data"]["delivered_quantity"] == 25

    # Faculty confirms equipment receipt
    eq_conf_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/equipment-confirm",
        json={"confirmed": True, "confirmation_notes": "All 25 units inspected and inventoried."},
        headers=faculty_headers,
    )
    assert eq_conf_res.status_code == 200
    assert eq_conf_res.json()["data"]["equipment_status"] == "DELIVERED"

    # 10. Pilot Deployment Evidence Upload & Verification
    pilot_payload = {
        "deployment_location": "Chakan MIDC Phase 2, Agro Corridor Unit 4",
        "evidence_url": "https://storage.sicp.gov.in/pilots/chakan_field_telemetry_report.pdf",
        "evidence_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    }
    pilot_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/pilot-evidence",
        json=pilot_payload,
        headers=ind_headers,
    )
    assert pilot_res.status_code == 200

    pilot_conf_res = await client.post(
        f"/api/v1/partnerships/agreements/{agreement_id}/pilot-confirm",
        json={"confirmed": True, "confirmation_notes": "Field pilot operational and data telemetry streaming."},
        headers=faculty_headers,
    )
    assert pilot_conf_res.status_code == 200
    assert pilot_conf_res.json()["data"]["pilot_status"] == "DEPLOYED"

    # 11. Verify Dynamic Coverage Metrics API
    cov_res = await client.get(
        f"/api/v1/partnerships/projects/{active_m5_project.id}/coverage",
        headers=faculty_headers,
    )
    assert cov_res.status_code == 200
    cov = cov_res.json()["data"]
    assert cov["total_funding_promised"] == 1000000.00
    assert cov["total_funding_released"] == 400000.00
    assert cov["total_mentorship_hours_completed"] == 3.5
    assert cov["equipment_delivered_quantity"] == 25
    assert cov["pilot_supported"] is True

    # 12. Check Immutable Audit Trail
    audit_res = await client.get(
        f"/api/v1/partnerships/agreements/{agreement_id}/audit-logs",
        headers=admin_headers,
    )
    assert audit_res.status_code == 200
    logs = audit_res.json()["data"]
    assert len(logs) >= 5
    actions = [l["action"] for l in logs]
    assert "PARTNERSHIP_AGREEMENT_CREATED" in actions
    assert "PARTNERSHIP_AGREEMENT_SUBMITTED" in actions
    assert "PARTNERSHIP_AGREEMENT_APPROVED" in actions
    assert "PARTNERSHIP_DISBURSEMENT_RELEASED" in actions
