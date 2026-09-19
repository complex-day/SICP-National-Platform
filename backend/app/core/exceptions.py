from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception with SICP standard error envelope support."""
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(status_code=status_code, detail=message, headers=headers)
        self.code = code
        self.message = message
        self.details = details or {}


class AuthenticationError(AppException):
    def __init__(self, message: str = "Could not validate credentials", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message,
            details=details,
            headers={"WWW-Authenticate": "Bearer"}
        )


class AuthorizationError(AppException):
    def __init__(self, message: str = "You do not have permission to perform this action", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message=message,
            details=details
        )


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=message,
            details=details
        )


class ConflictError(AppException):
    def __init__(self, message: str = "Resource already exists", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CONFLICT",
            message=message,
            details=details
        )


class ValidationException(AppException):
    def __init__(self, message: str = "Invalid input payload", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            message=message,
            details=details
        )


class InvalidStateTransitionError(AppException):
    def __init__(self, message: str = "Invalid state transition", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_STATE_TRANSITION",
            message=message,
            details=details
        )


class ConcurrencyConflictError(AppException):
    def __init__(self, message: str = "Resource version conflict. The resource was modified concurrently.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CONCURRENCY_CONFLICT",
            message=message,
            details=details
        )


class MaxAssetsExceededError(AppException):
    def __init__(self, message: str = "Maximum number of assets (5) exceeded for this challenge.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="MAX_ASSETS_EXCEEDED",
            message=message,
            details=details
        )


class PayloadTooLargeError(AppException):
    def __init__(self, message: str = "File size exceeds allowable limits", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            code="PAYLOAD_TOO_LARGE",
            message=message,
            details=details
        )


class UnsupportedMediaTypeError(AppException):
    def __init__(self, message: str = "Unsupported media or MIME type", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            code="UNSUPPORTED_MEDIA_TYPE",
            message=message,
            details=details
        )


# --- Module 3 Exceptions ---

class DuplicateTeamMembershipError(AppException):
    def __init__(self, message: str = "User is already an active member of a team solving this challenge", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_TEAM_MEMBERSHIP",
            message=message,
            details=details
        )


class DuplicateTeamOwnershipError(AppException):
    def __init__(self, message: str = "User already owns an active team associated with this challenge", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_ACTIVE_TEAM_OWNERSHIP",
            message=message,
            details=details
        )


class TeamCapacityExceededError(AppException):
    def __init__(self, message: str = "Team has reached its maximum student contributor capacity", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="TEAM_CAPACITY_EXCEEDED",
            message=message,
            details=details
        )


class MentorCapacityExceededError(AppException):
    def __init__(self, message: str = "Team has reached its maximum mentor capacity (max 2 mentors)", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="MENTOR_CAPACITY_EXCEEDED",
            message=message,
            details=details
        )


class InvalidTeamStateError(AppException):
    def __init__(self, message: str = "Cannot perform operations on a team in its current state", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_TEAM_STATE",
            message=message,
            details=details
        )


class InvitationExpiredError(AppException):
    def __init__(self, message: str = "This invitation has expired", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="INVITATION_EXPIRED",
            message=message,
            details=details
        )


class BadRequestError(AppException):
    def __init__(self, message: str = "Bad request", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="BAD_REQUEST",
            message=message,
            details=details
        )


# --- Module 4 Academic Collaboration Exceptions ---

class UniversityNotFoundError(AppException):
    def __init__(self, message: str = "University not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="UNIVERSITY_NOT_FOUND",
            message=message,
            details=details
        )


class DuplicateUniversityError(AppException):
    def __init__(self, message: str = "University with this name or code already exists", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_UNIVERSITY",
            message=message,
            details=details
        )


class UniversitySuspendedError(AppException):
    def __init__(self, message: str = "University is suspended and cannot perform new academic actions", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="UNIVERSITY_SUSPENDED",
            message=message,
            details=details
        )


class DepartmentNotFoundError(AppException):
    def __init__(self, message: str = "Department not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="DEPARTMENT_NOT_FOUND",
            message=message,
            details=details
        )


class DuplicateDepartmentError(AppException):
    def __init__(self, message: str = "Department with this name or code already exists in the university", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_DEPARTMENT",
            message=message,
            details=details
        )


class InvalidHODAffiliationError(AppException):
    def __init__(self, message: str = "Designated Head of Department must hold an active affiliation in this department and university", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_HOD_AFFILIATION",
            message=message,
            details=details
        )


class FacultyAffiliationNotFoundError(AppException):
    def __init__(self, message: str = "Faculty affiliation not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="AFFILIATION_NOT_FOUND",
            message=message,
            details=details
        )


class DuplicateActiveAffiliationError(AppException):
    def __init__(self, message: str = "Faculty member already holds an active university department affiliation", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_ACTIVE_AFFILIATION",
            message=message,
            details=details
        )


class AcademicIntakeNotFoundError(AppException):
    def __init__(self, message: str = "Academic challenge intake not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="INTAKE_NOT_FOUND",
            message=message,
            details=details
        )


class DuplicateChallengeClaimError(AppException):
    def __init__(self, message: str = "University has already claimed this challenge", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_CHALLENGE_CLAIM",
            message=message,
            details=details
        )


class ChallengeAlreadyAssignedError(AppException):
    def __init__(self, message: str = "Challenge cannot be claimed because it is no longer open for academic intake", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CHALLENGE_NOT_OPEN_FOR_INTAKE",
            message=message,
            details=details
        )


class FacultyMentorCapacityExceededError(AppException):
    def __init__(self, message: str = "Faculty member has reached the platform maximum of 3 active mentoring allocations", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="FACULTY_MENTOR_CAPACITY_EXCEEDED",
            message=message,
            details=details
        )


class DuplicateChallengeMentorshipError(AppException):
    def __init__(self, message: str = "Faculty member is already mentoring another team solving this exact challenge", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_CHALLENGE_MENTORSHIP",
            message=message,
            details=details
        )


class ActiveAcademicBindingsExistError(AppException):
    def __init__(self, message: str = "Cannot delete university because active affiliations or in-progress challenge intakes exist", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="ACTIVE_ACADEMIC_BINDINGS_EXIST",
            message=message,
            details=details
        )


# --- Module 5 Innovation Project Lifecycle Exceptions ---

class ProjectNotFoundError(AppException):
    def __init__(self, message: str = "Innovation project not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="PROJECT_NOT_FOUND",
            message=message,
            details=details
        )


class DuplicateProjectAllocationError(AppException):
    def __init__(self, message: str = "An innovation project is already active for this academic intake team allocation", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_PROJECT_ALLOCATION",
            message=message,
            details=details
        )


class InvalidAllocationBindingError(AppException):
    def __init__(self, message: str = "Specified intake team allocation is invalid, inactive, or not assigned to team", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_ALLOCATION_BINDING",
            message=message,
            details=details
        )


class InvalidMilestoneWeightSumError(AppException):
    def __init__(self, message: str = "Milestone weights must sum to exactly 100", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="INVALID_MILESTONE_WEIGHT_SUM",
            message=message,
            details=details
        )


class MilestoneNotFoundError(AppException):
    def __init__(self, message: str = "Project milestone not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="MILESTONE_NOT_FOUND",
            message=message,
            details=details
        )


class DuplicateMilestoneSequenceError(AppException):
    def __init__(self, message: str = "A milestone with this sequence index already exists in this project", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_MILESTONE_SEQUENCE",
            message=message,
            details=details
        )


class PreviousMilestonesIncompleteError(AppException):
    def __init__(self, message: str = "Previous sequential milestones must be approved before submitting this milestone", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="PREVIOUS_MILESTONES_INCOMPLETE",
            message=message,
            details=details
        )


class ApprovedMilestoneImmutableError(AppException):
    def __init__(self, message: str = "Approved milestones are immutable and cannot be updated or deleted", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="APPROVED_MILESTONE_IMMUTABLE",
            message=message,
            details=details
        )


class DeliverableNotFoundError(AppException):
    def __init__(self, message: str = "Project deliverable not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="DELIVERABLE_NOT_FOUND",
            message=message,
            details=details
        )


class DeliverableLockedForReviewError(AppException):
    def __init__(self, message: str = "Deliverables attached to submitted or under-review milestones are locked", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="DELIVERABLE_LOCKED_FOR_REVIEW",
            message=message,
            details=details
        )


class DuplicateAssetDetectedError(AppException):
    def __init__(self, message: str = "Duplicate asset with identical checksum already exists for this milestone", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_ASSET_DETECTED",
            message=message,
            details=details
        )


class UnauthorizedReviewerError(AppException):
    def __init__(self, message: str = "User is not authorized to review or sign off on this project milestone", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="UNAUTHORIZED_REVIEWER",
            message=message,
            details=details
        )


class ProjectNotReadyForCompletionError(AppException):
    def __init__(self, message: str = "Project cannot be completed until all mandatory milestones are approved (100% progress)", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="PROJECT_NOT_READY_FOR_COMPLETION",
            message=message,
            details=details
        )


class OptimisticLockError(AppException):
    def __init__(self, message: str = "Resource version conflict. The resource was modified concurrently.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="OPTIMISTIC_LOCK_ERROR",
            message=message,
            details=details
        )


# --- Module 6 Industry Partnership Exceptions ---

class PartnerNotFoundError(AppException):
    def __init__(self, message: str = "Industry partner not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="PARTNER_NOT_FOUND",
            message=message,
            details=details
        )


class DuplicatePartnerCINError(AppException):
    def __init__(self, message: str = "An industry partner with this CIN or registration number already exists", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_PARTNER_CIN",
            message=message,
            details=details
        )


class UnverifiedPartnerError(AppException):
    def __init__(self, message: str = "Industry partner is not verified and cannot create partnership agreements", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="UNVERIFIED_PARTNER",
            message=message,
            details=details
        )


class PartnerSuspendedError(AppException):
    def __init__(self, message: str = "Industry partner is suspended and cannot perform partnership operations", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="PARTNER_SUSPENDED",
            message=message,
            details=details
        )


class PartnershipAgreementNotFoundError(AppException):
    def __init__(self, message: str = "Partnership agreement not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="AGREEMENT_NOT_FOUND",
            message=message,
            details=details
        )


class InvalidProjectEligibilityError(AppException):
    def __init__(self, message: str = "Project status is not eligible for industry partnership agreements", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_PROJECT_ELIGIBILITY",
            message=message,
            details=details
        )


class FinancialInvariantViolationError(AppException):
    def __init__(self, message: str = "Financial invariant violation: total tranches or released amounts exceed promised bounds", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="FINANCIAL_INVARIANT_VIOLATION",
            message=message,
            details=details
        )


class DisbursementNotFoundError(AppException):
    def __init__(self, message: str = "Disbursement tranche not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="DISBURSEMENT_NOT_FOUND",
            message=message,
            details=details
        )


class DisbursementMilestoneNotApprovedError(AppException):
    def __init__(self, message: str = "Linked milestone is not approved. Cannot release milestone-gated disbursement.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="DISBURSEMENT_MILESTONE_NOT_APPROVED",
            message=message,
            details=details
        )


class MentorshipSessionNotFoundError(AppException):
    def __init__(self, message: str = "Mentorship session not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="MENTORSHIP_SESSION_NOT_FOUND",
            message=message,
            details=details
        )


class AgreementWithdrawnError(AppException):
    def __init__(self, message: str = "Partnership agreement has been withdrawn; no new disbursements, sessions, or deliveries are permitted", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="AGREEMENT_WITHDRAWN",
            message=message,
            details=details
        )


class PilotEvidenceMissingError(AppException):
    def __init__(self, message: str = "Valid deployment evidence artifact and checksum are required to fulfill pilot support", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="PILOT_EVIDENCE_MISSING",
            message=message,
            details=details
        )


class ImmutableAuditRecordError(AppException):
    def __init__(self, message: str = "Audit log records are immutable and cannot be updated or deleted", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="IMMUTABLE_AUDIT_RECORD",
            message=message,
            details=details
        )





