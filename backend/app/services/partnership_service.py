import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy import select, and_, func, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.partnership import (
    IndustryPartner,
    PartnershipAgreement,
    SponsorshipDisbursement,
    MentorshipSession,
)
from app.models.project import InnovationProject, ProjectMilestone
from app.models.team import TeamMember
from app.repositories.partnership_repository import PartnershipRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.audit_repository import AuditRepository
from app.core.constants import (
    UserRole,
    AuditAction,
    PartnerVerificationStatus,
    CommitmentStatus,
    DisbursementStatus,
    MentorshipSessionStatus,
    EquipmentStatus,
    PilotStatus,
)
from app.core.exceptions import (
    PartnerNotFoundError,
    DuplicatePartnerCINError,
    UnverifiedPartnerError,
    PartnerSuspendedError,
    PartnershipAgreementNotFoundError,
    InvalidProjectEligibilityError,
    FinancialInvariantViolationError,
    DisbursementNotFoundError,
    DisbursementMilestoneNotApprovedError,
    MentorshipSessionNotFoundError,
    AgreementWithdrawnError,
    PilotEvidenceMissingError,
    AuthorizationError,
    InvalidStateTransitionError,
    ValidationException,
    OptimisticLockError,
    AppException,
)
from app.schemas.partnership import (
    IndustryPartnerCreate,
    IndustryPartnerUpdate,
    IndustryPartnerVerify,
    PartnershipAgreementCreate,
    PartnershipAgreementUpdate,
    PartnershipAgreementApprove,
    PartnershipAgreementWithdraw,
    SponsorshipDisbursementCreate,
    SponsorshipDisbursementRelease,
    MentorshipSessionCreate,
    MentorshipSessionVerify,
    EquipmentDeliveryCreate,
    EquipmentDeliveryConfirm,
    PilotEvidenceCreate,
    PilotEvidenceConfirm,
)

ELIGIBLE_PROJECT_STATUSES = {"PROPOSAL", "ACTIVE", "PROTOTYPE", "PILOT", "REVIEW_READY"}


class PilotEvidenceRequiredError(AppException):
    def __init__(self, message: str = "Pilot deployment evidence and checksum verification required before fulfillment", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=400,
            code="PILOT_EVIDENCE_REQUIRED",
            message=message,
            details=details,
        )


class PartnershipService:
    """Service orchestrating business workflows for the Industry Partnership Network."""

    # --- Industry Partner Operations ---

    @staticmethod
    async def register_partner(
        db: AsyncSession,
        current_user: User,
        data: IndustryPartnerCreate,
    ) -> IndustryPartner:
        repo = PartnershipRepository(db)

        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        if user_role not in (UserRole.INDUSTRY.value, UserRole.ADMIN.value):
            raise AuthorizationError("Only industry representatives and platform admins can register industry partner profiles.")

        existing = await repo.get_partner_by_cin(data.cin_number, db)
        if existing:
            raise DuplicatePartnerCINError(f"Partner with CIN {data.cin_number} is already registered.")

        partner = IndustryPartner(
            id=uuid.uuid4(),
            company_name=data.company_name,
            domain=data.domain,
            cin_number=data.cin_number,
            csr_budget=data.csr_budget,
            website=data.website,
            point_of_contact_name=data.point_of_contact_name,
            point_of_contact_email=data.point_of_contact_email,
            point_of_contact_phone=data.point_of_contact_phone,
            verification_status=PartnerVerificationStatus.PENDING_VERIFICATION.value,
            user_id=current_user.id,
            created_by=current_user.id,
            version=1,
            is_deleted=False,
        )

        saved = await repo.create_partner(partner, db)

        await AuditRepository.create_log(
            session=db,
            action="INDUSTRY_PARTNER_REGISTERED",
            entity_type="industry_partner",
            user_id=current_user.id,
            entity_id=saved.id,
            metadata={"company_name": saved.company_name, "cin_number": saved.cin_number},
        )
        return saved

    @staticmethod
    async def verify_partner(
        db: AsyncSession,
        current_user: User,
        partner_id: uuid.UUID,
        data: IndustryPartnerVerify,
    ) -> IndustryPartner:
        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        if user_role != UserRole.ADMIN.value:
            raise AuthorizationError("Only platform administrators can verify or modify partner accreditation status.")

        repo = PartnershipRepository(db)
        partner = await repo.get_partner_by_id(partner_id, db)
        if not partner:
            raise PartnerNotFoundError()

        target_status = data.status.value if hasattr(data.status, "value") else str(data.status)
        old_status = partner.verification_status
        partner.verification_status = target_status
        partner.verification_notes = data.verification_notes
        partner.verified_by = current_user.id
        partner.verified_at = datetime.now(timezone.utc)

        updated = await repo.update_partner(partner, db=db)

        audit_action = AuditAction.PARTNER_VERIFIED
        if target_status == PartnerVerificationStatus.SUSPENDED.value:
            audit_action = AuditAction.PARTNER_SUSPENDED
        elif target_status == PartnerVerificationStatus.VERIFIED.value and old_status == PartnerVerificationStatus.SUSPENDED.value:
            audit_action = AuditAction.PARTNER_REACTIVATED

        await AuditRepository.create_log(
            session=db,
            action=audit_action,
            entity_type="industry_partner",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={
                "previous_status": old_status,
                "new_status": target_status,
                "notes": data.verification_notes,
            },
        )
        return updated

    @staticmethod
    async def get_partner(db: AsyncSession, partner_id: uuid.UUID) -> IndustryPartner:
        repo = PartnershipRepository(db)
        partner = await repo.get_partner_by_id(partner_id, db)
        if not partner:
            raise PartnerNotFoundError()
        return partner

    @staticmethod
    async def list_partners(
        db: AsyncSession,
        verification_status: Optional[str] = None,
        domain: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[IndustryPartner], int]:
        repo = PartnershipRepository(db)
        return await repo.list_partners(
            verification_status=verification_status,
            domain=domain,
            search=search,
            limit=limit,
            offset=offset,
            db=db,
        )

    # --- Partnership Agreement Operations ---

    @staticmethod
    async def create_agreement(
        db: AsyncSession,
        current_user: User,
        data: PartnershipAgreementCreate,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)

        partner = await repo.get_partner_by_id(data.partner_id, db)
        if not partner:
            raise PartnerNotFoundError()

        if partner.verification_status == PartnerVerificationStatus.SUSPENDED.value:
            raise PartnerSuspendedError("Cannot create agreements for a suspended industry partner.")
        if partner.verification_status != PartnerVerificationStatus.VERIFIED.value:
            raise UnverifiedPartnerError("Industry partner must be VERIFIED by platform administration to create partnership proposals.")

        project = await ProjectRepository.get_project_by_id(db, data.project_id)
        if not project:
            raise InvalidProjectEligibilityError(f"Innovation project {data.project_id} not found.")

        proj_status = project.status.value if hasattr(project.status, "value") else str(project.status)
        if proj_status not in ELIGIBLE_PROJECT_STATUSES:
            raise InvalidProjectEligibilityError(
                f"Project status '{proj_status}' is not eligible for sponsorship agreements."
            )

        partner_type_str = data.partnership_type.value if hasattr(data.partnership_type, "value") else str(data.partnership_type)

        agreement = PartnershipAgreement(
            id=uuid.uuid4(),
            partner_id=data.partner_id,
            project_id=data.project_id,
            partnership_type=partner_type_str,
            status=CommitmentStatus.PROPOSED.value,
            promised_amount=data.promised_amount,
            released_amount=0.0,
            promised_hours=data.promised_hours,
            completed_hours=0.0,
            equipment_description=data.equipment_description,
            equipment_quantity=data.equipment_quantity,
            delivered_quantity=0,
            equipment_status=EquipmentStatus.PENDING.value,
            pilot_support_description=data.pilot_support_description,
            pilot_status=PilotStatus.COMMITTED.value,
            terms_and_conditions=data.terms_and_conditions,
            created_by=current_user.id,
            version=1,
            is_deleted=False,
        )

        saved = await repo.create_agreement(agreement, db)

        # Auto-create scheduled tranches if provided in initial proposal
        if data.tranches:
            for t_data in data.tranches:
                m_id = uuid.UUID(t_data["milestone_id"]) if "milestone_id" in t_data and t_data["milestone_id"] else None
                disb = SponsorshipDisbursement(
                    id=uuid.uuid4(),
                    agreement_id=saved.id,
                    milestone_id=m_id,
                    tranche_number=t_data.get("tranche_number", 1),
                    amount=t_data.get("amount", 0.0),
                    status=DisbursementStatus.SCHEDULED.value,
                    version=1,
                    is_deleted=False,
                )
                await repo.create_disbursement(disb, db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_AGREEMENT_CREATED,
            entity_type="partnership_agreement",
            user_id=current_user.id,
            entity_id=saved.id,
            metadata={
                "partner_id": str(saved.partner_id),
                "project_id": str(saved.project_id),
                "partnership_type": saved.partnership_type,
                "promised_amount": saved.promised_amount,
            },
        )
        return await repo.get_agreement_by_id(saved.id, db)

    @staticmethod
    async def update_agreement(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
        data: PartnershipAgreementUpdate,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if data.version is not None and agreement.version != data.version:
            raise OptimisticLockError(
                message=f"Agreement version mismatch. Expected {data.version}, found {agreement.version}."
            )

        if data.terms_and_conditions is not None:
            agreement.terms_and_conditions = data.terms_and_conditions
        if data.promised_amount is not None:
            agreement.promised_amount = data.promised_amount
        if data.promised_hours is not None:
            agreement.promised_hours = data.promised_hours
        if data.equipment_description is not None:
            agreement.equipment_description = data.equipment_description
        if data.equipment_quantity is not None:
            agreement.equipment_quantity = data.equipment_quantity
        if data.pilot_support_description is not None:
            agreement.pilot_support_description = data.pilot_support_description

        return await repo.update_agreement(agreement, expected_version=data.version, db=db)

    @staticmethod
    async def submit_agreement(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if agreement.status not in (CommitmentStatus.DRAFT.value, CommitmentStatus.PROPOSED.value):
            raise InvalidStateTransitionError(
                f"Agreement cannot be submitted from status '{agreement.status}'."
            )

        agreement.status = CommitmentStatus.SUBMITTED.value
        updated = await repo.update_agreement(agreement, db=db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_AGREEMENT_SUBMITTED,
            entity_type="partnership_agreement",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"status": updated.status},
        )
        return updated

    @staticmethod
    async def approve_agreement(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
        data: Optional[PartnershipAgreementApprove] = None,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if agreement.status not in (CommitmentStatus.SUBMITTED.value, CommitmentStatus.DRAFT.value, CommitmentStatus.PROPOSED.value):
            raise InvalidStateTransitionError(
                f"Agreement cannot be approved from status '{agreement.status}'."
            )

        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        project = await ProjectRepository.get_project_by_id(db, agreement.project_id)
        is_faculty_mentor = project and (
            project.primary_faculty_mentor_id == current_user.id
            or project.secondary_mentor_id == current_user.id
        )
        is_admin = user_role == UserRole.ADMIN.value

        is_team_leader = False
        if project and project.team_id:
            stmt = select(TeamMember).where(
                and_(
                    TeamMember.team_id == project.team_id,
                    TeamMember.user_id == current_user.id,
                    TeamMember.role.in_(["LEADER", "CO_LEADER"]),
                    TeamMember.status == "ACTIVE",
                )
            )
            res = await db.execute(stmt)
            is_team_leader = res.scalar_one_or_none() is not None

        # Sponsors or member students cannot approve
        if not (is_faculty_mentor or is_team_leader or is_admin):
            raise AuthorizationError("Only the project supervising faculty mentor, team leader, or admin can approve partnership proposals.")

        agreement.status = CommitmentStatus.APPROVED.value
        agreement.approved_by = current_user.id
        agreement.approved_at = datetime.now(timezone.utc)
        if data and data.approval_notes:
            agreement.approval_notes = data.approval_notes

        updated = await repo.update_agreement(agreement, db=db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_AGREEMENT_APPROVED,
            entity_type="partnership_agreement",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"approved_by": str(current_user.id), "status": updated.status},
        )
        return updated

    @staticmethod
    async def reject_agreement(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
        rejection_notes: Optional[str] = None,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if agreement.status not in (CommitmentStatus.SUBMITTED.value, CommitmentStatus.PROPOSED.value):
            raise InvalidStateTransitionError(f"Agreement cannot be rejected from status '{agreement.status}'.")

        agreement.status = CommitmentStatus.REJECTED.value
        if rejection_notes:
            agreement.approval_notes = rejection_notes

        updated = await repo.update_agreement(agreement, db=db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_AGREEMENT_REJECTED,
            entity_type="partnership_agreement",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"rejection_notes": rejection_notes},
        )
        return updated

    @staticmethod
    async def fulfill_agreement(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if agreement.partnership_type in ("PILOT", "PILOT_DEPLOYMENT") and agreement.pilot_status != PilotStatus.DEPLOYED.value:
            raise PilotEvidenceRequiredError()

        if agreement.status in (CommitmentStatus.DRAFT.value, CommitmentStatus.PROPOSED.value, CommitmentStatus.SUBMITTED.value):
            raise InvalidStateTransitionError("Agreement must be approved before fulfillment.")

        agreement.status = CommitmentStatus.FULFILLED.value
        return await repo.update_agreement(agreement, db=db)

    @staticmethod
    async def withdraw_agreement(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
        data: PartnershipAgreementWithdraw,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if agreement.status in (CommitmentStatus.WITHDRAWN.value, CommitmentStatus.TERMINATED.value, CommitmentStatus.FULFILLED.value):
            raise InvalidStateTransitionError(f"Agreement cannot be withdrawn from terminal status '{agreement.status}'.")

        disbursements = await repo.list_disbursements_by_agreement_id(agreement.id, db)
        for d in disbursements:
            if d.status in (DisbursementStatus.SCHEDULED.value, DisbursementStatus.PENDING_MILESTONE.value):
                d.status = DisbursementStatus.CANCELLED.value
                await repo.update_disbursement(d, db=db)

        agreement.status = CommitmentStatus.WITHDRAWN.value
        agreement.withdrawal_reason = data.withdrawal_reason
        agreement.withdrawn_at = datetime.now(timezone.utc)
        agreement.withdrawn_by = current_user.id

        updated = await repo.update_agreement(agreement, db=db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_AGREEMENT_WITHDRAWN,
            entity_type="partnership_agreement",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"withdrawal_reason": data.withdrawal_reason},
        )
        return updated

    @staticmethod
    async def get_agreement(db: AsyncSession, agreement_id: uuid.UUID) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()
        return agreement

    @staticmethod
    async def list_agreements(
        db: AsyncSession,
        partner_id: Optional[uuid.UUID] = None,
        project_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        partnership_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[PartnershipAgreement], int]:
        repo = PartnershipRepository(db)
        return await repo.list_agreements(
            partner_id=partner_id,
            project_id=project_id,
            status=status,
            partnership_type=partnership_type,
            limit=limit,
            offset=offset,
            db=db,
        )

    # --- Sponsorship Disbursements Operations ---

    @staticmethod
    async def schedule_disbursement(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
        data: SponsorshipDisbursementCreate,
    ) -> SponsorshipDisbursement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if agreement.status == CommitmentStatus.WITHDRAWN.value:
            raise AgreementWithdrawnError("Cannot schedule disbursements for a withdrawn partnership agreement.")

        partner = await repo.get_partner_by_id(agreement.partner_id, db)
        if partner and partner.verification_status == PartnerVerificationStatus.SUSPENDED.value:
            raise PartnerSuspendedError("Partner is suspended. Cannot schedule new disbursements.")

        if data.amount <= 0:
            raise FinancialInvariantViolationError("Disbursement amount must be greater than zero.")

        existing_disbursements = await repo.list_disbursements_by_agreement_id(agreement_id, db)
        active_disbursements = [
            d for d in existing_disbursements if d.status != DisbursementStatus.CANCELLED.value
        ]
        scheduled_sum = sum(d.amount for d in active_disbursements)

        if scheduled_sum + data.amount > agreement.promised_amount:
            raise FinancialInvariantViolationError(
                f"Cumulative scheduled tranches cannot exceed promised amount."
            )

        init_status = (
            DisbursementStatus.PENDING_MILESTONE.value
            if data.milestone_id
            else DisbursementStatus.SCHEDULED.value
        )

        disbursement = SponsorshipDisbursement(
            id=uuid.uuid4(),
            agreement_id=agreement.id,
            milestone_id=data.milestone_id,
            tranche_number=data.tranche_number,
            amount=data.amount,
            status=init_status,
            due_date=data.due_date,
            disbursement_notes=data.disbursement_notes,
            version=1,
            is_deleted=False,
        )

        saved = await repo.create_disbursement(disbursement, db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_DISBURSEMENT_SCHEDULED,
            entity_type="sponsorship_disbursement",
            user_id=current_user.id,
            entity_id=saved.id,
            metadata={
                "agreement_id": str(saved.agreement_id),
                "tranche_number": saved.tranche_number,
                "amount": saved.amount,
            },
        )
        return saved

    @staticmethod
    async def list_disbursements(
        db: AsyncSession,
        agreement_id: uuid.UUID,
    ) -> List[SponsorshipDisbursement]:
        repo = PartnershipRepository(db)
        return await repo.list_disbursements_by_agreement_id(agreement_id, db)

    @staticmethod
    async def release_disbursement(
        db: AsyncSession,
        current_user: User,
        disbursement_id: uuid.UUID,
        data: SponsorshipDisbursementRelease,
    ) -> SponsorshipDisbursement:
        repo = PartnershipRepository(db)
        disbursement = await repo.get_disbursement_by_id(disbursement_id, db)
        if not disbursement:
            raise DisbursementNotFoundError()

        agreement = await repo.get_agreement_by_id(disbursement.agreement_id, db)
        if not agreement or agreement.status == CommitmentStatus.WITHDRAWN.value:
            raise AgreementWithdrawnError("Cannot release disbursements for a withdrawn partnership agreement.")

        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        if user_role not in (UserRole.INDUSTRY.value, UserRole.ADMIN.value):
            raise AuthorizationError("Only industry sponsors or platform administrators can execute disbursement releases.")

        if disbursement.milestone_id:
            milestone_stmt = select(ProjectMilestone).where(
                and_(
                    func.cast(ProjectMilestone.id, String) == str(disbursement.milestone_id),
                    ProjectMilestone.is_deleted.is_(False),
                )
            )
            res = await db.execute(milestone_stmt)
            milestone = res.scalar_one_or_none()
            if not milestone:
                project = await ProjectRepository.get_project_by_id(db, agreement.project_id)
                if project and project.milestones:
                    milestone = next(
                        (m for m in project.milestones if str(m.id) == str(disbursement.milestone_id)),
                        None,
                    )

            if not milestone or (str(getattr(milestone.status, "value", milestone.status)).upper() != "APPROVED"):
                raise DisbursementMilestoneNotApprovedError("Linked milestone must be APPROVED prior to tranche release.")

        if disbursement.status == DisbursementStatus.RELEASED.value:
            raise InvalidStateTransitionError("Disbursement has already been released.")

        disbursement.status = DisbursementStatus.RELEASED.value
        disbursement.released_at = datetime.now(timezone.utc)
        disbursement.released_by = current_user.id
        disbursement.transaction_reference = data.transaction_reference
        if data.disbursement_notes:
            disbursement.disbursement_notes = data.disbursement_notes

        updated_disbursement = await repo.update_disbursement(disbursement, db=db)

        agreement.released_amount += disbursement.amount
        if agreement.released_amount >= agreement.promised_amount and agreement.status in (CommitmentStatus.APPROVED.value, CommitmentStatus.ACTIVE.value):
            agreement.status = CommitmentStatus.FULFILLED.value

        await repo.update_agreement(agreement, db=db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_DISBURSEMENT_RELEASED,
            entity_type="sponsorship_disbursement",
            user_id=current_user.id,
            entity_id=updated_disbursement.id,
            metadata={
                "amount": updated_disbursement.amount,
                "transaction_reference": data.transaction_reference,
            },
        )
        return updated_disbursement

    # --- Mentorship Sessions Operations ---

    @staticmethod
    async def log_mentorship_session(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
        data: MentorshipSessionCreate,
    ) -> MentorshipSession:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if agreement.status == CommitmentStatus.WITHDRAWN.value:
            raise AgreementWithdrawnError("Cannot log mentorship sessions for a withdrawn partnership agreement.")

        if data.duration_hours <= 0:
            raise ValidationException("Duration hours must be strictly positive.")

        mentor_id = data.mentor_id or current_user.id

        session_obj = MentorshipSession(
            id=uuid.uuid4(),
            agreement_id=agreement.id,
            mentor_id=mentor_id,
            session_date=data.session_date,
            duration_hours=data.duration_hours,
            topic=data.topic or "Mentorship Session",
            summary=data.summary or data.topic or "Session Summary",
            status=MentorshipSessionStatus.LOGGED.value,
            attended=True,
            version=1,
            is_deleted=False,
        )

        saved = await repo.create_mentorship_session(session_obj, db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_MENTORSHIP_LOGGED,
            entity_type="mentorship_session",
            user_id=current_user.id,
            entity_id=saved.id,
            metadata={"duration_hours": saved.duration_hours, "topic": saved.topic},
        )
        return saved

    @staticmethod
    async def verify_mentorship_session(
        db: AsyncSession,
        current_user: User,
        session_id: uuid.UUID,
        data: MentorshipSessionVerify,
    ) -> MentorshipSession:
        repo = PartnershipRepository(db)
        session_obj = await repo.get_mentorship_session_by_id(session_id, db)
        if not session_obj:
            raise MentorshipSessionNotFoundError()

        agreement = await repo.get_agreement_by_id(session_obj.agreement_id, db)

        is_verified = (data.status == "VERIFIED" or data.attended is True) if data.status is not None else data.attended

        if is_verified:
            session_obj.status = MentorshipSessionStatus.VERIFIED.value
            if agreement:
                agreement.completed_hours += session_obj.duration_hours
                await repo.update_agreement(agreement, db=db)
        else:
            session_obj.status = MentorshipSessionStatus.REJECTED.value

        session_obj.attended = is_verified
        session_obj.student_rating = data.student_rating
        session_obj.feedback = data.feedback
        session_obj.verified_at = datetime.now(timezone.utc)
        session_obj.verified_by = current_user.id

        updated = await repo.update_mentorship_session(session_obj, db=db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_MENTORSHIP_VERIFIED,
            entity_type="mentorship_session",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"attended": is_verified, "rating": data.student_rating},
        )
        return updated

    # --- Equipment Delivery Operations ---

    @staticmethod
    async def log_equipment_delivery(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
        data: EquipmentDeliveryCreate,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if agreement.status == CommitmentStatus.WITHDRAWN.value:
            raise AgreementWithdrawnError("Cannot record equipment deliveries on a withdrawn agreement.")

        agreement.delivered_quantity += (data.delivered_quantity or 1)
        if agreement.delivery_manifest_url is None:
            agreement.delivery_manifest_url = data.delivery_manifest_url
        if data.manifest_hash:
            agreement.manifest_hash = data.manifest_hash
        if data.delivery_notes:
            agreement.delivery_notes = data.delivery_notes

        agreement.equipment_status = (
            EquipmentStatus.DELIVERED.value
            if agreement.delivered_quantity >= agreement.equipment_quantity
            else EquipmentStatus.PARTIALLY_DELIVERED.value
        )

        if agreement.partnership_type == "EQUIPMENT" and agreement.equipment_status == EquipmentStatus.DELIVERED.value:
            agreement.status = CommitmentStatus.FULFILLED.value

        updated = await repo.update_agreement(agreement, db=db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_EQUIPMENT_DELIVERED,
            entity_type="partnership_agreement",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"delivered_quantity": agreement.delivered_quantity},
        )
        return updated

    @staticmethod
    async def confirm_equipment_receipt(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
        data: EquipmentDeliveryConfirm,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if data.confirmed:
            agreement.equipment_status = EquipmentStatus.DELIVERED.value
        return await repo.update_agreement(agreement, db=db)

    # --- Pilot Support & Evidence Operations ---

    @staticmethod
    async def upload_pilot_evidence(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
        data: PilotEvidenceCreate,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if agreement.status == CommitmentStatus.WITHDRAWN.value:
            raise AgreementWithdrawnError("Cannot upload pilot evidence on a withdrawn agreement.")

        if not data.evidence_url or not (data.evidence_hash or data.evidence_checksum):
            raise PilotEvidenceMissingError("Valid evidence URL and checksum hash are mandatory.")

        agreement.deployment_location = data.deployment_location
        agreement.evidence_url = data.evidence_url
        agreement.evidence_hash = data.evidence_hash or data.evidence_checksum
        agreement.pilot_status = PilotStatus.DEPLOYED.value

        if agreement.partnership_type in ("PILOT", "PILOT_DEPLOYMENT"):
            agreement.status = CommitmentStatus.FULFILLED.value

        updated = await repo.update_agreement(agreement, db=db)

        await AuditRepository.create_log(
            session=db,
            action=AuditAction.PARTNERSHIP_PILOT_DEPLOYED,
            entity_type="partnership_agreement",
            user_id=current_user.id,
            entity_id=updated.id,
            metadata={"deployment_location": data.deployment_location},
        )
        return updated

    @staticmethod
    async def confirm_pilot_deployment(
        db: AsyncSession,
        current_user: User,
        agreement_id: uuid.UUID,
        data: PilotEvidenceConfirm,
    ) -> PartnershipAgreement:
        repo = PartnershipRepository(db)
        agreement = await repo.get_agreement_by_id(agreement_id, db)
        if not agreement:
            raise PartnershipAgreementNotFoundError()

        if data.confirmed:
            agreement.pilot_status = PilotStatus.DEPLOYED.value

        return await repo.update_agreement(agreement, db=db)

    # --- Coverage Metrics ---

    @staticmethod
    async def get_project_coverage(
        db: AsyncSession,
        project_id: uuid.UUID,
        target_budget: Optional[float] = None,
    ) -> Dict[str, Any]:
        repo = PartnershipRepository(db)
        coverage = await repo.get_project_coverage(project_id, db)
        if target_budget and target_budget > 0:
            coverage["funding_coverage_percentage"] = round(
                (coverage["total_funding_promised"] / target_budget * 100.0), 2
            )
            coverage["funding_gap"] = max(0.0, target_budget - coverage["total_funding_promised"])
        coverage["active_sponsors_count"] = coverage["sponsor_count"]
        return coverage
