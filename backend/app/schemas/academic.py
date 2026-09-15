from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
import re

from app.core.constants import (
    UniversityStatus,
    AffiliationStatus,
    IntakeStatus,
    IntakeType,
    TeamAllocationStatus,
)


# --- University Schemas ---

class UniversityBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255, description="Official legal name of the university")
    code: str = Field(..., min_length=2, max_length=50, description="Unique uppercase university identifier code")
    district: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    address: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=255)
    contact_email: EmailStr
    contact_phone: Optional[str] = Field(None, max_length=20)
    accreditation_details: Optional[Dict[str, Any]] = Field(default_factory=dict)
    domain_expertise: Optional[List[str]] = Field(default_factory=list)

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        v = v.strip().upper()
        if not re.match(r"^[A-Z0-9_\-]+$", v):
            raise ValueError("University code must contain only uppercase alphanumeric characters, hyphens, or underscores.")
        return v

    @field_validator("domain_expertise")
    @classmethod
    def validate_domain_expertise(cls, v: Optional[List[str]]) -> List[str]:
        if v is None:
            return []
        if len(v) > 15:
            raise ValueError("A maximum of 15 domain expertise tags is allowed.")
        return [tag.strip() for tag in v if tag.strip()]


class UniversityCreate(UniversityBase):
    pass


class UniversityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    district: Optional[str] = Field(None, min_length=2, max_length=100)
    state: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=20)
    accreditation_details: Optional[Dict[str, Any]] = None
    domain_expertise: Optional[List[str]] = None
    version: int = Field(..., description="Current resource version for optimistic concurrency control")

    @field_validator("domain_expertise")
    @classmethod
    def validate_domain_expertise(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return None
        if len(v) > 15:
            raise ValueError("A maximum of 15 domain expertise tags is allowed.")
        return [tag.strip() for tag in v if tag.strip()]


class UniversityStatusUpdate(BaseModel):
    status: UniversityStatus
    version: int = Field(..., description="Current version for optimistic locking")


class UniversityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    code: str
    district: str
    state: str
    address: Optional[str] = None
    website: Optional[str] = None
    contact_email: str
    contact_phone: Optional[str] = None
    status: UniversityStatus
    accreditation_details: Dict[str, Any] = Field(default_factory=dict)
    domain_expertise: List[str] = Field(default_factory=list)
    created_by: UUID
    verified_by: Optional[UUID] = None
    verified_at: Optional[datetime] = None
    version: int
    created_at: datetime
    updated_at: datetime


class UniversityListResponse(BaseModel):
    items: List[UniversityResponse]
    total: int
    page: int
    limit: int


# --- Department Schemas ---

class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=2, max_length=50)
    specializations: Optional[List[str]] = Field(default_factory=list)
    contact_email: Optional[EmailStr] = None

    @field_validator("code")
    @classmethod
    def validate_dept_code(cls, v: str) -> str:
        v = v.strip().upper()
        if not re.match(r"^[A-Z0-9_\-]+$", v):
            raise ValueError("Department code must contain only uppercase alphanumeric characters, hyphens, or underscores.")
        return v


class DepartmentCreate(DepartmentBase):
    head_of_department_id: Optional[UUID] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    specializations: Optional[List[str]] = None
    contact_email: Optional[EmailStr] = None


class DepartmentHODUpdate(BaseModel):
    head_of_department_id: Optional[UUID] = None


class DepartmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    university_id: UUID
    name: str
    code: str
    head_of_department_id: Optional[UUID] = None
    specializations: List[str] = Field(default_factory=list)
    contact_email: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DepartmentListResponse(BaseModel):
    items: List[DepartmentResponse]
    total: int


# --- Faculty Affiliation Schemas ---

class FacultyAffiliationCreate(BaseModel):
    university_id: UUID
    department_id: UUID
    designation: str = Field(..., min_length=2, max_length=100)


class FacultyAffiliationVerify(BaseModel):
    action: str = Field(..., description="'APPROVE' or 'REJECT'")

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        v = v.strip().upper()
        if v not in ("APPROVE", "REJECT"):
            raise ValueError("Action must be either 'APPROVE' or 'REJECT'.")
        return v


class FacultyAffiliationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    faculty_id: UUID
    university_id: UUID
    department_id: UUID
    designation: str
    status: AffiliationStatus
    verified_by: Optional[UUID] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class FacultyAffiliationListResponse(BaseModel):
    items: List[FacultyAffiliationResponse]
    total: int


# --- Multi-Factor Matching Schemas ---

class MatchingBreakdown(BaseModel):
    domain_expertise_score: float = Field(..., ge=0.0, le=100.0)
    faculty_availability_score: float = Field(..., ge=0.0, le=100.0)
    proximity_score: float = Field(..., ge=0.0, le=100.0)
    track_record_score: float = Field(..., ge=0.0, le=100.0)
    student_cohort_score: float = Field(..., ge=0.0, le=100.0)


class UniversityMatchResponse(BaseModel):
    university_id: UUID
    university_name: str
    total_score: float = Field(..., ge=0.0, le=100.0)
    breakdown: MatchingBreakdown
    explanation: str


class FacultyMatchResponse(BaseModel):
    faculty_id: UUID
    faculty_name: str
    department_id: UUID
    department_name: str
    match_score: float = Field(..., ge=0.0, le=100.0)
    active_mentorship_count: int
    research_interests: List[str] = Field(default_factory=list)
    explanation: str


# --- Academic Intake & Team Allocation Schemas ---

class AcademicIntakeClaimRequest(BaseModel):
    challenge_id: UUID
    university_id: UUID


class IntakeTeamAllocationCreate(BaseModel):
    team_id: UUID
    department_id: UUID
    faculty_mentor_id: UUID


class IntakeTeamAllocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    intake_id: UUID
    team_id: UUID
    department_id: UUID
    faculty_mentor_id: UUID
    status: TeamAllocationStatus
    allocated_by: UUID
    allocated_at: datetime
    created_at: datetime


class AcademicIntakeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    challenge_id: UUID
    university_id: UUID
    status: IntakeStatus
    intake_type: IntakeType
    match_score: float
    match_reasoning: Dict[str, Any] = Field(default_factory=dict)
    claimed_by: Optional[UUID] = None
    claimed_at: Optional[datetime] = None
    allocations: List[IntakeTeamAllocationResponse] = Field(default_factory=list)
    version: int
    created_at: datetime
    updated_at: datetime


class AcademicIntakeListResponse(BaseModel):
    items: List[AcademicIntakeResponse]
    total: int
