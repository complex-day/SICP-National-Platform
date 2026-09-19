from typing import Optional, List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.partnership import (
    IndustryPartnerCreate,
    IndustryPartnerUpdate,
    IndustryPartnerVerify,
    IndustryPartnerResponse,
    PartnershipAgreementCreate,
    PartnershipAgreementUpdate,
    PartnershipAgreementApprove,
    PartnershipAgreementWithdraw,
    PartnershipAgreementResponse,
    SponsorshipDisbursementCreate,
    SponsorshipDisbursementRelease,
    SponsorshipDisbursementResponse,
    MentorshipSessionCreate,
    MentorshipSessionVerify,
    MentorshipSessionResponse,
    EquipmentDeliveryCreate,
    EquipmentDeliveryConfirm,
    PilotEvidenceCreate,
    PilotEvidenceConfirm,
    ProjectCoverageResponse,
)
from app.schemas.common import StandardResponse
from app.services.partnership_service import PartnershipService
from app.repositories.partnership_repository import PartnershipRepository
from app.repositories.audit_repository import AuditRepository

router = APIRouter(prefix="/partnerships", tags=["Industry Partnership Network"])


# --- Industry Partner Endpoints ---

@router.post(
    "/partners",
    response_model=StandardResponse[IndustryPartnerResponse],
    status_code=status.HTTP_201_CREATED,
)
async def register_partner(
    data: IndustryPartnerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await PartnershipService.register_partner(db, current_user, data)
    return StandardResponse(data=partner)


@router.get(
    "/partners",
    response_model=StandardResponse[List[IndustryPartnerResponse]],
)
async def list_partners(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    verification_status: Optional[str] = None,
    domain: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    partners, _ = await PartnershipService.list_partners(
        db,
        verification_status=verification_status,
        domain=domain,
        search=search,
        limit=limit,
        offset=offset,
    )
    return StandardResponse(data=partners)


@router.get(
    "/partners/{partner_id}",
    response_model=StandardResponse[IndustryPartnerResponse],
)
async def get_partner(
    partner_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    partner = await PartnershipService.get_partner(db, partner_id)
    return StandardResponse(data=partner)


@router.patch(
    "/partners/{partner_id}/verify",
    response_model=StandardResponse[IndustryPartnerResponse],
)
async def verify_partner(
    partner_id: UUID,
    data: IndustryPartnerVerify,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.verify_partner(db, current_user, partner_id, data)
    return StandardResponse(data=updated)


# --- Partnership Agreement Endpoints ---

@router.post(
    "/agreements",
    response_model=StandardResponse[PartnershipAgreementResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_agreement(
    data: PartnershipAgreementCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    agreement = await PartnershipService.create_agreement(db, current_user, data)
    return StandardResponse(data=agreement)


@router.get(
    "/agreements",
    response_model=StandardResponse[List[PartnershipAgreementResponse]],
)
async def list_agreements(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    partner_id: Optional[UUID] = None,
    project_id: Optional[UUID] = None,
    status: Optional[str] = None,
    partnership_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    agreements, _ = await PartnershipService.list_agreements(
        db,
        partner_id=partner_id,
        project_id=project_id,
        status=status,
        partnership_type=partnership_type,
        limit=limit,
        offset=offset,
    )
    return StandardResponse(data=agreements)


@router.get(
    "/agreements/{agreement_id}",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def get_agreement(
    agreement_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    agreement = await PartnershipService.get_agreement(db, agreement_id)
    return StandardResponse(data=agreement)


@router.patch(
    "/agreements/{agreement_id}",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def update_agreement(
    agreement_id: UUID,
    data: PartnershipAgreementUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.update_agreement(db, current_user, agreement_id, data)
    return StandardResponse(data=updated)


@router.post(
    "/agreements/{agreement_id}/submit",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def submit_agreement(
    agreement_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.submit_agreement(db, current_user, agreement_id)
    return StandardResponse(data=updated)


@router.post(
    "/agreements/{agreement_id}/approve",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def approve_agreement(
    agreement_id: UUID,
    data: Optional[PartnershipAgreementApprove] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.approve_agreement(db, current_user, agreement_id, data)
    return StandardResponse(data=updated)


@router.post(
    "/agreements/{agreement_id}/reject",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def reject_agreement(
    agreement_id: UUID,
    rejection_notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.reject_agreement(db, current_user, agreement_id, rejection_notes)
    return StandardResponse(data=updated)


@router.post(
    "/agreements/{agreement_id}/fulfill",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def fulfill_agreement(
    agreement_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.fulfill_agreement(db, current_user, agreement_id)
    return StandardResponse(data=updated)


@router.post(
    "/agreements/{agreement_id}/withdraw",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def withdraw_agreement(
    agreement_id: UUID,
    data: PartnershipAgreementWithdraw,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.withdraw_agreement(db, current_user, agreement_id, data)
    return StandardResponse(data=updated)


# --- Sponsorship Disbursements Endpoints ---

@router.post(
    "/agreements/{agreement_id}/disbursements",
    response_model=StandardResponse[SponsorshipDisbursementResponse],
    status_code=status.HTTP_201_CREATED,
)
async def schedule_disbursement(
    agreement_id: UUID,
    data: SponsorshipDisbursementCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    disbursement = await PartnershipService.schedule_disbursement(db, current_user, agreement_id, data)
    return StandardResponse(data=disbursement)


@router.get(
    "/agreements/{agreement_id}/disbursements",
    response_model=StandardResponse[List[SponsorshipDisbursementResponse]],
)
async def list_disbursements(
    agreement_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    disbursements = await PartnershipService.list_disbursements(db, agreement_id)
    return StandardResponse(data=disbursements)


@router.post(
    "/disbursements/{disbursement_id}/release",
    response_model=StandardResponse[SponsorshipDisbursementResponse],
)
async def release_disbursement(
    disbursement_id: UUID,
    data: SponsorshipDisbursementRelease,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.release_disbursement(db, current_user, disbursement_id, data)
    return StandardResponse(data=updated)


# --- Mentorship Sessions Endpoints ---

@router.post(
    "/agreements/{agreement_id}/mentorship-sessions",
    response_model=StandardResponse[MentorshipSessionResponse],
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/agreements/{agreement_id}/sessions",
    response_model=StandardResponse[MentorshipSessionResponse],
    status_code=status.HTTP_201_CREATED,
)
async def log_mentorship_session(
    agreement_id: UUID,
    data: MentorshipSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session_obj = await PartnershipService.log_mentorship_session(db, current_user, agreement_id, data)
    return StandardResponse(data=session_obj)


@router.post(
    "/mentorship-sessions/{session_id}/verify",
    response_model=StandardResponse[MentorshipSessionResponse],
)
@router.patch(
    "/sessions/{session_id}/verify",
    response_model=StandardResponse[MentorshipSessionResponse],
)
async def verify_mentorship_session(
    session_id: UUID,
    data: MentorshipSessionVerify,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.verify_mentorship_session(db, current_user, session_id, data)
    return StandardResponse(data=updated)


# --- Equipment Delivery Endpoints ---

@router.post(
    "/agreements/{agreement_id}/equipment-delivery",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def log_equipment_delivery(
    agreement_id: UUID,
    data: EquipmentDeliveryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.log_equipment_delivery(db, current_user, agreement_id, data)
    return StandardResponse(data=updated)


@router.post(
    "/agreements/{agreement_id}/equipment-confirm",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def confirm_equipment_receipt(
    agreement_id: UUID,
    data: EquipmentDeliveryConfirm,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.confirm_equipment_receipt(db, current_user, agreement_id, data)
    return StandardResponse(data=updated)


# --- Pilot Evidence Endpoints ---

@router.post(
    "/agreements/{agreement_id}/pilot-evidence",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def upload_pilot_evidence(
    agreement_id: UUID,
    data: PilotEvidenceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.upload_pilot_evidence(db, current_user, agreement_id, data)
    return StandardResponse(data=updated)


@router.post(
    "/agreements/{agreement_id}/pilot-confirm",
    response_model=StandardResponse[PartnershipAgreementResponse],
)
async def confirm_pilot_deployment(
    agreement_id: UUID,
    data: PilotEvidenceConfirm,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await PartnershipService.confirm_pilot_deployment(db, current_user, agreement_id, data)
    return StandardResponse(data=updated)


# --- Coverage Metrics & Audit Logs ---

@router.get(
    "/projects/{project_id}/coverage",
    response_model=StandardResponse[ProjectCoverageResponse],
)
async def get_project_coverage(
    project_id: UUID,
    target_budget: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
):
    coverage = await PartnershipService.get_project_coverage(db, project_id, target_budget=target_budget)
    return StandardResponse(data=coverage)


@router.get(
    "/agreements/{agreement_id}/audit-logs",
    response_model=StandardResponse[List[Dict[str, Any]]],
)
async def get_agreement_audit_logs(
    agreement_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = PartnershipRepository(db)
    disbs = await repo.list_disbursements_by_agreement_id(agreement_id, db)
    sessions = await repo.list_mentorship_sessions_by_agreement_id(agreement_id, db)
    entity_ids = [agreement_id] + [d.id for d in disbs] + [s.id for s in sessions]

    from sqlalchemy import select
    from app.models.audit_log import AuditLog
    stmt = (
        select(AuditLog)
        .where(AuditLog.entity_id.in_(entity_ids))
        .order_by(AuditLog.created_at.asc())
    )
    res = await db.execute(stmt)
    logs = list(res.scalars().all())

    formatted = [
        {
            "id": str(log.id),
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": str(log.entity_id) if log.entity_id else None,
            "user_id": str(log.user_id) if log.user_id else None,
            "metadata": log.metadata_json,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]
    return StandardResponse(data=formatted)
