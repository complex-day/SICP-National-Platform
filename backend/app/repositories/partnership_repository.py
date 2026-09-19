import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.partnership import (
    IndustryPartner,
    PartnershipAgreement,
    SponsorshipDisbursement,
    MentorshipSession,
)
from app.models.project import InnovationProject
from app.core.exceptions import (
    PartnerNotFoundError,
    PartnershipAgreementNotFoundError,
    DisbursementNotFoundError,
    MentorshipSessionNotFoundError,
    OptimisticLockError,
)


class PartnershipRepository:
    """Repository handling database operations for the Industry Partnership Network."""

    def __init__(self, db: Optional[AsyncSession] = None):
        self._db = db

    def _get_session(self, db: Optional[AsyncSession] = None) -> AsyncSession:
        session = db or self._db
        if session is None:
            raise ValueError("AsyncSession must be provided either at init or method call.")
        return session

    # --- Industry Partner Operations ---

    async def create_partner(
        self, partner: IndustryPartner, db: Optional[AsyncSession] = None
    ) -> IndustryPartner:
        session = self._get_session(db)
        session.add(partner)
        await session.commit()
        await session.refresh(partner)
        return partner

    async def get_partner_by_id(
        self, partner_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> Optional[IndustryPartner]:
        session = self._get_session(db)
        stmt = (
            select(IndustryPartner)
            .where(and_(IndustryPartner.id == partner_id, IndustryPartner.is_deleted.is_(False)))
            .options(
                selectinload(IndustryPartner.verifier),
                selectinload(IndustryPartner.owner),
                selectinload(IndustryPartner.creator),
                selectinload(IndustryPartner.agreements),
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_partner_by_cin(
        self, cin_number: str, db: Optional[AsyncSession] = None
    ) -> Optional[IndustryPartner]:
        session = self._get_session(db)
        stmt = select(IndustryPartner).where(
            and_(
                IndustryPartner.cin_number == cin_number,
                IndustryPartner.is_deleted.is_(False),
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_partner_by_user_id(
        self, user_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> Optional[IndustryPartner]:
        session = self._get_session(db)
        stmt = select(IndustryPartner).where(
            and_(
                IndustryPartner.user_id == user_id,
                IndustryPartner.is_deleted.is_(False),
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_partners(
        self,
        verification_status: Optional[str] = None,
        domain: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        db: Optional[AsyncSession] = None,
    ) -> Tuple[List[IndustryPartner], int]:
        session = self._get_session(db)
        filters = [IndustryPartner.is_deleted.is_(False)]

        if verification_status:
            filters.append(IndustryPartner.verification_status == verification_status)
        if domain:
            filters.append(IndustryPartner.domain.ilike(f"%{domain}%"))
        if search:
            filters.append(
                or_(
                    IndustryPartner.company_name.ilike(f"%{search}%"),
                    IndustryPartner.cin_number.ilike(f"%{search}%"),
                    IndustryPartner.domain.ilike(f"%{search}%"),
                )
            )

        count_stmt = select(func.count(IndustryPartner.id)).where(and_(*filters))
        count_res = await session.execute(count_stmt)
        total = count_res.scalar() or 0

        stmt = (
            select(IndustryPartner)
            .where(and_(*filters))
            .order_by(IndustryPartner.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await session.execute(stmt)
        partners = list(result.scalars().all())
        return partners, total

    async def update_partner(
        self,
        partner: IndustryPartner,
        expected_version: Optional[int] = None,
        db: Optional[AsyncSession] = None,
    ) -> IndustryPartner:
        session = self._get_session(db)
        if expected_version is not None and partner.version != expected_version:
            raise OptimisticLockError(
                message=f"Partner version mismatch. Expected {expected_version}, found {partner.version}."
            )
        partner.version += 1
        await session.commit()
        await session.refresh(partner)
        return partner

    async def update_partner_with_version_check(
        self,
        partner_id: uuid.UUID,
        expected_version: int,
        update_data: Dict[str, Any],
        db: Optional[AsyncSession] = None,
    ) -> IndustryPartner:
        session = self._get_session(db)
        partner = await self.get_partner_by_id(partner_id, session)
        if not partner:
            raise PartnerNotFoundError()
        if partner.version != expected_version:
            raise OptimisticLockError(
                message=f"Partner version mismatch. Expected {expected_version}, found {partner.version}."
            )
        for key, val in update_data.items():
            if hasattr(partner, key):
                setattr(partner, key, val)
        partner.version += 1
        await session.commit()
        await session.refresh(partner)
        return partner

    # --- Partnership Agreement Operations ---

    async def create_agreement(
        self, agreement: PartnershipAgreement, db: Optional[AsyncSession] = None
    ) -> PartnershipAgreement:
        session = self._get_session(db)
        session.add(agreement)
        await session.commit()
        await session.refresh(agreement)
        return agreement

    async def get_agreement_by_id(
        self, agreement_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> Optional[PartnershipAgreement]:
        session = self._get_session(db)
        stmt = (
            select(PartnershipAgreement)
            .where(
                and_(
                    PartnershipAgreement.id == agreement_id,
                    PartnershipAgreement.is_deleted.is_(False),
                )
            )
            .options(
                selectinload(PartnershipAgreement.partner),
                selectinload(PartnershipAgreement.project),
                selectinload(PartnershipAgreement.approver),
                selectinload(PartnershipAgreement.withdrawer),
                selectinload(PartnershipAgreement.disbursements),
                selectinload(PartnershipAgreement.mentorship_sessions),
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_agreements(
        self,
        partner_id: Optional[uuid.UUID] = None,
        project_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        partnership_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        db: Optional[AsyncSession] = None,
    ) -> Tuple[List[PartnershipAgreement], int]:
        session = self._get_session(db)
        filters = [PartnershipAgreement.is_deleted.is_(False)]

        if partner_id:
            filters.append(PartnershipAgreement.partner_id == partner_id)
        if project_id:
            filters.append(PartnershipAgreement.project_id == project_id)
        if status:
            filters.append(PartnershipAgreement.status == status)
        if partnership_type:
            filters.append(PartnershipAgreement.partnership_type == partnership_type)

        count_stmt = select(func.count(PartnershipAgreement.id)).where(and_(*filters))
        count_res = await session.execute(count_stmt)
        total = count_res.scalar() or 0

        stmt = (
            select(PartnershipAgreement)
            .where(and_(*filters))
            .options(
                selectinload(PartnershipAgreement.partner),
                selectinload(PartnershipAgreement.project),
                selectinload(PartnershipAgreement.disbursements),
                selectinload(PartnershipAgreement.mentorship_sessions),
            )
            .order_by(PartnershipAgreement.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await session.execute(stmt)
        agreements = list(result.scalars().all())
        return agreements, total

    async def update_agreement(
        self,
        agreement: PartnershipAgreement,
        expected_version: Optional[int] = None,
        db: Optional[AsyncSession] = None,
    ) -> PartnershipAgreement:
        session = self._get_session(db)
        if expected_version is not None and agreement.version != expected_version:
            raise OptimisticLockError(
                message=f"Agreement version mismatch. Expected {expected_version}, found {agreement.version}."
            )
        agreement.version += 1
        await session.commit()
        await session.refresh(agreement)
        return agreement

    async def update_agreement_with_version_check(
        self,
        agreement_id: uuid.UUID,
        expected_version: int,
        update_data: Dict[str, Any],
        db: Optional[AsyncSession] = None,
    ) -> PartnershipAgreement:
        session = self._get_session(db)
        agreement = await self.get_agreement_by_id(agreement_id, session)
        if not agreement:
            raise PartnershipAgreementNotFoundError()
        if agreement.version != expected_version:
            raise OptimisticLockError(
                message=f"Agreement version mismatch. Expected {expected_version}, found {agreement.version}."
            )
        for key, val in update_data.items():
            if hasattr(agreement, key):
                setattr(agreement, key, val)
        agreement.version += 1
        await session.commit()
        await session.refresh(agreement)
        return agreement

    # --- Sponsorship Disbursement Operations ---

    async def create_disbursement(
        self,
        disbursement: SponsorshipDisbursement,
        db: Optional[AsyncSession] = None,
    ) -> SponsorshipDisbursement:
        session = self._get_session(db)
        session.add(disbursement)
        await session.commit()
        await session.refresh(disbursement)
        return disbursement

    async def get_disbursement_by_id(
        self, disbursement_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> Optional[SponsorshipDisbursement]:
        session = self._get_session(db)
        stmt = (
            select(SponsorshipDisbursement)
            .where(
                and_(
                    SponsorshipDisbursement.id == disbursement_id,
                    SponsorshipDisbursement.is_deleted.is_(False),
                )
            )
            .options(
                selectinload(SponsorshipDisbursement.agreement),
                selectinload(SponsorshipDisbursement.milestone),
                selectinload(SponsorshipDisbursement.releaser),
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_disbursements_by_agreement_id(
        self, agreement_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> List[SponsorshipDisbursement]:
        session = self._get_session(db)
        stmt = (
            select(SponsorshipDisbursement)
            .where(
                and_(
                    SponsorshipDisbursement.agreement_id == agreement_id,
                    SponsorshipDisbursement.is_deleted.is_(False),
                )
            )
            .order_by(SponsorshipDisbursement.tranche_number.asc())
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())

    async def update_disbursement(
        self,
        disbursement: SponsorshipDisbursement,
        expected_version: Optional[int] = None,
        db: Optional[AsyncSession] = None,
    ) -> SponsorshipDisbursement:
        session = self._get_session(db)
        if expected_version is not None and disbursement.version != expected_version:
            raise OptimisticLockError(
                message=f"Disbursement version mismatch. Expected {expected_version}, found {disbursement.version}."
            )
        disbursement.version += 1
        await session.commit()
        await session.refresh(disbursement)
        return disbursement

    # --- Mentorship Session Operations ---

    async def create_mentorship_session(
        self,
        session_obj: MentorshipSession,
        db: Optional[AsyncSession] = None,
    ) -> MentorshipSession:
        session = self._get_session(db)
        session.add(session_obj)
        await session.commit()
        await session.refresh(session_obj)
        return session_obj

    async def get_mentorship_session_by_id(
        self, session_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> Optional[MentorshipSession]:
        session = self._get_session(db)
        stmt = (
            select(MentorshipSession)
            .where(
                and_(
                    MentorshipSession.id == session_id,
                    MentorshipSession.is_deleted.is_(False),
                )
            )
            .options(
                selectinload(MentorshipSession.agreement),
                selectinload(MentorshipSession.mentor),
                selectinload(MentorshipSession.verifier),
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_mentorship_sessions_by_agreement_id(
        self, agreement_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> List[MentorshipSession]:
        session = self._get_session(db)
        stmt = (
            select(MentorshipSession)
            .where(
                and_(
                    MentorshipSession.agreement_id == agreement_id,
                    MentorshipSession.is_deleted.is_(False),
                )
            )
            .order_by(MentorshipSession.session_date.desc())
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())

    async def update_mentorship_session(
        self,
        session_obj: MentorshipSession,
        expected_version: Optional[int] = None,
        db: Optional[AsyncSession] = None,
    ) -> MentorshipSession:
        session = self._get_session(db)
        if expected_version is not None and session_obj.version != expected_version:
            raise OptimisticLockError(
                message=f"Session version mismatch. Expected {expected_version}, found {session_obj.version}."
            )
        session_obj.version += 1
        await session.commit()
        await session.refresh(session_obj)
        return session_obj

    # --- Project Coverage Aggregation ---

    async def get_project_coverage(
        self, project_id: uuid.UUID, db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        session = self._get_session(db)

        # Retrieve all agreements for this project
        stmt = (
            select(PartnershipAgreement)
            .where(
                and_(
                    PartnershipAgreement.project_id == project_id,
                    PartnershipAgreement.is_deleted.is_(False),
                )
            )
        )
        result = await session.execute(stmt)
        all_agreements = list(result.scalars().all())

        active_agreements = [
            a for a in all_agreements if a.status in ("APPROVED", "ACTIVE", "FULFILLED")
        ]
        withdrawn_agreements = [a for a in all_agreements if a.status == "WITHDRAWN"]

        total_funding_promised = sum(a.promised_amount for a in active_agreements)
        total_funding_released = sum(a.released_amount for a in active_agreements)
        funding_gap = max(0.0, total_funding_promised - total_funding_released)
        funding_coverage_pct = (
            (total_funding_released / total_funding_promised * 100.0)
            if total_funding_promised > 0
            else 0.0
        )

        total_hours_promised = sum(a.promised_hours for a in active_agreements)
        total_hours_completed = sum(a.completed_hours for a in active_agreements)
        mentorship_coverage_pct = (
            (total_hours_completed / total_hours_promised * 100.0)
            if total_hours_promised > 0
            else 0.0
        )

        eq_promised = sum(a.equipment_quantity for a in active_agreements)
        eq_delivered = sum(a.delivered_quantity for a in active_agreements)
        equipment_coverage_pct = (
            (eq_delivered / eq_promised * 100.0) if eq_promised > 0 else 0.0
        )

        pilot_supported = any(
            a.pilot_status in ("DEPLOYED", "VERIFIED") for a in active_agreements
        )

        distinct_sponsors = {a.partner_id for a in active_agreements}

        return {
            "project_id": project_id,
            "sponsor_count": len(distinct_sponsors),
            "total_funding_promised": total_funding_promised,
            "total_funding_released": total_funding_released,
            "funding_gap": funding_gap,
            "funding_coverage_percentage": round(funding_coverage_pct, 2),
            "total_mentorship_hours_promised": total_hours_promised,
            "total_mentorship_hours_completed": total_hours_completed,
            "mentorship_coverage_percentage": round(mentorship_coverage_pct, 2),
            "equipment_promised_quantity": eq_promised,
            "equipment_delivered_quantity": eq_delivered,
            "equipment_coverage_percentage": round(equipment_coverage_pct, 2),
            "pilot_supported": pilot_supported,
            "active_agreements_count": len(active_agreements),
            "withdrawn_agreements_count": len(withdrawn_agreements),
        }
