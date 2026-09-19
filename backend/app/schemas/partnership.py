from datetime import datetime, date
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator, computed_field
import re

from app.core.constants import (
    PartnerVerificationStatus,
    CommitmentStatus,
    DisbursementStatus,
    MentorshipSessionStatus,
    PartnershipType,
    EquipmentStatus,
    PilotStatus,
)


# --- Industry Partner Schemas ---

class IndustryPartnerBase(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255)
    domain: str = Field(..., min_length=2, max_length=100)
    cin_number: str = Field(..., min_length=5, max_length=50)
    csr_budget: float = Field(default=0.0, ge=0.0)
    website: Optional[str] = Field(None, max_length=500)
    point_of_contact_name: Optional[str] = Field(None, max_length=255)
    point_of_contact_email: Optional[str] = Field(None, max_length=255)
    point_of_contact_phone: Optional[str] = Field(None, max_length=50)


class IndustryPartnerCreate(IndustryPartnerBase):
    pass


class IndustryPartnerUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2, max_length=255)
    domain: Optional[str] = Field(None, min_length=2, max_length=100)
    csr_budget: Optional[float] = Field(None, ge=0.0)
    website: Optional[str] = Field(None, max_length=500)
    point_of_contact_name: Optional[str] = Field(None, min_length=2, max_length=255)
    point_of_contact_email: Optional[str] = Field(None, min_length=5, max_length=255)
    point_of_contact_phone: Optional[str] = Field(None, max_length=50)


class IndustryPartnerVerify(BaseModel):
    status: PartnerVerificationStatus = Field(..., description="Target status: VERIFIED, SUSPENDED, INACTIVE")
    verification_notes: Optional[str] = Field(None, description="Admin accreditation rationale notes")


class IndustryPartnerResponse(IndustryPartnerBase):
    id: UUID
    verification_status: PartnerVerificationStatus
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None
    verified_by: Optional[UUID] = None
    user_id: Optional[UUID] = None
    created_by: Optional[UUID] = None
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Sponsorship Disbursement Schemas ---

class SponsorshipDisbursementBase(BaseModel):
    milestone_id: Optional[UUID] = Field(None, description="Linked project milestone ID")
    tranche_number: int = Field(..., ge=1, description="Sequential tranche index (1-indexed)")
    amount: float = Field(..., gt=0.0, description="Tranche funding amount in INR")
    due_date: Optional[date] = Field(None, description="Target release date")
    disbursement_notes: Optional[str] = None


class SponsorshipDisbursementCreate(SponsorshipDisbursementBase):
    pass


class SponsorshipDisbursementRelease(BaseModel):
    transaction_reference: str = Field(..., min_length=3, max_length=100, description="Banking UTR / Transaction Reference")
    invoice_number: Optional[str] = None
    disbursement_notes: Optional[str] = None


class SponsorshipDisbursementResponse(SponsorshipDisbursementBase):
    id: UUID
    agreement_id: UUID
    status: DisbursementStatus
    disbursement_status: Optional[str] = None
    released_at: Optional[datetime] = None
    released_by: Optional[UUID] = None
    transaction_reference: Optional[str] = None
    version: int
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="after")
    def populate_aliases(self) -> "SponsorshipDisbursementResponse":
        self.disbursement_status = self.status.value if hasattr(self.status, "value") else str(self.status)
        return self

    model_config = ConfigDict(from_attributes=True)


# --- Mentorship Session Schemas ---

class MentorshipSessionCreate(BaseModel):
    mentor_id: Optional[UUID] = None
    mentor_user_id: Optional[UUID] = None
    session_date: datetime = Field(..., description="Timestamp when the session took place")
    duration_hours: float = Field(..., gt=0.0, le=24.0, description="Duration in decimal hours (e.g. 2.5)")
    topic: Optional[str] = None
    topics_covered: Optional[str] = None
    summary: Optional[str] = None

    @model_validator(mode="after")
    def normalize_fields(self) -> "MentorshipSessionCreate":
        if self.mentor_id is None and self.mentor_user_id is not None:
            self.mentor_id = self.mentor_user_id
        if not self.topic and self.topics_covered:
            self.topic = self.topics_covered
        elif not self.topic:
            self.topic = "Corporate Mentorship Session"
        if not self.summary:
            self.summary = self.topics_covered or self.topic
        return self


class MentorshipSessionVerify(BaseModel):
    status: Optional[str] = None
    attended: bool = Field(default=True, description="Whether the team attended the session")
    student_rating: Optional[int] = Field(None, ge=1, le=5, description="Optional quality rating (1-5 stars)")
    feedback: Optional[str] = Field(None, description="Optional qualitative student feedback")


class MentorshipSessionResponse(BaseModel):
    id: UUID
    agreement_id: UUID
    mentor_id: UUID
    session_date: datetime
    duration_hours: float
    topic: str
    summary: str
    status: MentorshipSessionStatus
    attended: bool
    student_rating: Optional[int] = None
    feedback: Optional[str] = None
    verified_at: Optional[datetime] = None
    verified_by: Optional[UUID] = None
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Equipment Delivery Schemas ---

class EquipmentDeliveryCreate(BaseModel):
    delivered_quantity: Optional[int] = None
    quantity: Optional[int] = None
    item_name: Optional[str] = None
    delivery_manifest_url: Optional[str] = None
    manifest_hash: Optional[str] = None
    receipt_reference: Optional[str] = None
    receipt_checksum: Optional[str] = None
    delivery_notes: Optional[str] = None

    @model_validator(mode="after")
    def normalize_fields(self) -> "EquipmentDeliveryCreate":
        if self.delivered_quantity is None:
            self.delivered_quantity = self.quantity or 1
        if not self.manifest_hash and self.receipt_checksum:
            self.manifest_hash = self.receipt_checksum
        if not self.delivery_notes and self.receipt_reference:
            self.delivery_notes = f"Receipt: {self.receipt_reference}"
        return self


class EquipmentDeliveryConfirm(BaseModel):
    confirmed: bool = Field(default=True)
    confirmation_notes: Optional[str] = None


# --- Pilot Evidence Schemas ---

class PilotEvidenceCreate(BaseModel):
    deployment_location: Optional[str] = None
    evidence_url: str = Field(..., min_length=5, max_length=500)
    evidence_hash: Optional[str] = None
    evidence_checksum: Optional[str] = None
    summary: Optional[str] = None

    @model_validator(mode="after")
    def normalize_fields(self) -> "PilotEvidenceCreate":
        if not self.evidence_hash and self.evidence_checksum:
            self.evidence_hash = self.evidence_checksum
        if not self.deployment_location:
            self.deployment_location = "Field Pilot Site"
        return self


class PilotEvidenceConfirm(BaseModel):
    confirmed: bool = Field(default=True)
    confirmation_notes: Optional[str] = None


# --- Partnership Agreement Schemas ---

class PartnershipAgreementBase(BaseModel):
    partner_id: UUID
    project_id: UUID
    partnership_type: PartnershipType = Field(default=PartnershipType.FUNDING)
    promised_amount: float = Field(default=0.0, ge=0.0)
    promised_hours: float = Field(default=0.0, ge=0.0)
    equipment_description: Optional[str] = None
    equipment_quantity: int = Field(default=0, ge=0)
    pilot_support_description: Optional[str] = None
    terms_and_conditions: Optional[str] = None


class PartnershipAgreementCreate(PartnershipAgreementBase):
    tranches: Optional[List[Dict[str, Any]]] = None
    equipment_details: Optional[List[Dict[str, Any]]] = None
    pilot_details: Optional[Dict[str, Any]] = None
    mentor_user_id: Optional[UUID] = None

    @model_validator(mode="after")
    def validate_invariants(self) -> "PartnershipAgreementCreate":
        type_str = self.partnership_type.value if hasattr(self.partnership_type, "value") else str(self.partnership_type)
        if type_str in ("FUNDING", "CSR_GRANT") and self.promised_amount <= 0.0:
            raise ValueError("Promised funding amount must be strictly greater than zero.")

        if self.equipment_details:
            total_qty = sum(item.get("quantity", 1) for item in self.equipment_details)
            if self.equipment_quantity == 0:
                self.equipment_quantity = total_qty
            if not self.equipment_description:
                self.equipment_description = ", ".join(item.get("item_name", "Equipment") for item in self.equipment_details)

        if self.pilot_details:
            if not self.pilot_support_description:
                self.pilot_support_description = self.pilot_details.get("scope", "Pilot Support")

        if self.tranches:
            tranche_sum = sum(t.get("amount", 0.0) for t in self.tranches)
            if tranche_sum > self.promised_amount:
                raise ValueError(
                    f"Sum of tranches (₹{tranche_sum:,.2f}) cannot exceed promised amount (₹{self.promised_amount:,.2f})."
                )
        return self


class PartnershipAgreementUpdate(BaseModel):
    promised_amount: Optional[float] = Field(None, ge=0.0)
    promised_hours: Optional[float] = Field(None, ge=0.0)
    equipment_description: Optional[str] = None
    equipment_quantity: Optional[int] = Field(None, ge=0)
    pilot_support_description: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    version: Optional[int] = None


class PartnershipAgreementApprove(BaseModel):
    approval_notes: Optional[str] = None


class PartnershipAgreementWithdraw(BaseModel):
    withdrawal_reason: str = Field(..., min_length=5, description="Mandatory reason for terminating/withdrawing the commitment")


class PartnershipAgreementResponse(PartnershipAgreementBase):
    id: UUID
    status: CommitmentStatus
    commitment_status: Optional[str] = None
    remaining_amount: Optional[float] = None
    released_amount: float = 0.0
    completed_hours: float = 0.0
    delivered_quantity: int = 0
    equipment_status: EquipmentStatus
    delivery_manifest_url: Optional[str] = None
    manifest_hash: Optional[str] = None
    delivery_notes: Optional[str] = None
    pilot_status: PilotStatus
    deployment_location: Optional[str] = None
    evidence_url: Optional[str] = None
    evidence_hash: Optional[str] = None
    approval_notes: Optional[str] = None
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    withdrawal_reason: Optional[str] = None
    withdrawn_at: Optional[datetime] = None
    withdrawn_by: Optional[UUID] = None
    created_by: Optional[UUID] = None
    version: int
    created_at: datetime
    updated_at: datetime
    disbursements: Optional[List[SponsorshipDisbursementResponse]] = Field(default_factory=list)
    mentorship_sessions: Optional[List[MentorshipSessionResponse]] = Field(default_factory=list)

    @model_validator(mode="after")
    def populate_computed_fields(self) -> "PartnershipAgreementResponse":
        self.commitment_status = self.status.value if hasattr(self.status, "value") else str(self.status)
        self.remaining_amount = max(0.0, self.promised_amount - self.released_amount)
        return self

    model_config = ConfigDict(from_attributes=True)


# --- Project Coverage Response Schema ---

class ProjectCoverageResponse(BaseModel):
    project_id: UUID
    sponsor_count: int
    active_sponsors_count: int
    total_funding_promised: float
    total_funding_released: float
    funding_gap: float
    funding_coverage_percentage: float
    total_mentorship_hours_promised: float
    total_mentorship_hours_completed: float
    mentorship_coverage_percentage: float
    equipment_promised_quantity: int
    equipment_delivered_quantity: int
    equipment_coverage_percentage: float
    pilot_supported: bool
    active_agreements_count: int
    withdrawn_agreements_count: int
