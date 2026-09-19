import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Text, ForeignKey, DateTime, Date, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin


class IndustryPartner(Base, TimestampMixin):
    __tablename__ = "industry_partners"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    domain: Mapped[str] = mapped_column(String(100), nullable=False)
    cin_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    csr_budget: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    point_of_contact_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    point_of_contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    point_of_contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    verification_status: Mapped[str] = mapped_column(
        String(30), default="PENDING_VERIFICATION", nullable=False, index=True
    )
    verification_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    verifier: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[verified_by], lazy="selectin"
    )
    owner: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[user_id], lazy="selectin"
    )
    creator: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[created_by], lazy="selectin"
    )
    agreements: Mapped[List["PartnershipAgreement"]] = relationship(
        "PartnershipAgreement", back_populates="partner", lazy="selectin"
    )


class PartnershipAgreement(Base, TimestampMixin):
    __tablename__ = "partnership_agreements"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    partner_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("industry_partners.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    partnership_type: Mapped[str] = mapped_column(String(50), default="FUNDING", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="DRAFT", nullable=False, index=True)

    @property
    def commitment_status(self) -> str:
        return self.status

    @commitment_status.setter
    def commitment_status(self, value: Any) -> None:
        self.status = value.value if hasattr(value, "value") else str(value)


    # Funding parameters
    promised_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    released_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Mentorship parameters
    promised_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Equipment parameters
    equipment_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    equipment_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    delivered_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    equipment_status: Mapped[str] = mapped_column(String(30), default="PENDING", nullable=False)
    delivery_manifest_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    manifest_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    delivery_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Pilot parameters
    pilot_support_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pilot_status: Mapped[str] = mapped_column(String(30), default="COMMITTED", nullable=False)
    deployment_location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    evidence_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    evidence_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    # Legal terms & approvals
    terms_and_conditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approval_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Withdrawal
    withdrawal_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    withdrawn_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    withdrawn_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    partner: Mapped["IndustryPartner"] = relationship(
        "IndustryPartner", back_populates="agreements", lazy="selectin"
    )
    project: Mapped["InnovationProject"] = relationship(
        "InnovationProject", lazy="selectin"
    )
    approver: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[approved_by], lazy="selectin"
    )
    withdrawer: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[withdrawn_by], lazy="selectin"
    )
    disbursements: Mapped[List["SponsorshipDisbursement"]] = relationship(
        "SponsorshipDisbursement",
        back_populates="agreement",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    mentorship_sessions: Mapped[List["MentorshipSession"]] = relationship(
        "MentorshipSession",
        back_populates="agreement",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class SponsorshipDisbursement(Base, TimestampMixin):
    __tablename__ = "sponsorship_disbursements"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    agreement_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("partnership_agreements.id", ondelete="CASCADE"), nullable=False, index=True
    )
    milestone_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("project_milestones.id", ondelete="SET NULL"), nullable=True, index=True
    )
    tranche_number: Mapped[int] = mapped_column(Integer, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="SCHEDULED", nullable=False, index=True)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    released_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    released_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    transaction_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    disbursement_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    agreement: Mapped["PartnershipAgreement"] = relationship(
        "PartnershipAgreement", back_populates="disbursements"
    )
    milestone: Mapped[Optional["ProjectMilestone"]] = relationship(
        "ProjectMilestone", lazy="selectin"
    )
    releaser: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[released_by], lazy="selectin"
    )


class MentorshipSession(Base, TimestampMixin):
    __tablename__ = "partnership_mentorship_sessions"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    agreement_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("partnership_agreements.id", ondelete="CASCADE"), nullable=False, index=True
    )
    mentor_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    session_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_hours: Mapped[float] = mapped_column(Float, nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="LOGGED", nullable=False, index=True)
    attended: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    student_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    agreement: Mapped["PartnershipAgreement"] = relationship(
        "PartnershipAgreement", back_populates="mentorship_sessions"
    )
    mentor: Mapped["User"] = relationship(
        "User", foreign_keys=[mentor_id], lazy="selectin"
    )
    verifier: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[verified_by], lazy="selectin"
    )
