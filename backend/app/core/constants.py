import enum


class UserRole(str, enum.Enum):
    """Immutable user roles across the SICP platform."""
    CITIZEN = "citizen"
    STUDENT = "student"
    FACULTY = "faculty"
    INDUSTRY = "industry"
    GOVERNMENT = "government"
    ADMIN = "admin"


class UserStatus(str, enum.Enum):
    """User account lifecycle statuses."""
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    SUSPENDED = "SUSPENDED"
    BANNED = "BANNED"


class AuditAction(str, enum.Enum):
    """Standardized audit actions for system logging."""
    USER_REGISTERED = "USER_REGISTERED"
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILED = "LOGIN_FAILED"
    USER_LOGOUT = "USER_LOGOUT"
    PASSWORD_CHANGED = "PASSWORD_CHANGED"
    PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED"
    PASSWORD_RESET_COMPLETED = "PASSWORD_RESET_COMPLETED"
    ROLE_UPDATED = "ROLE_UPDATED"
    STATUS_UPDATED = "STATUS_UPDATED"
    # M2 Challenge Actions
    CHALLENGE_CREATED = "CHALLENGE_CREATED"
    CHALLENGE_UPDATED = "CHALLENGE_UPDATED"
    STATUS_CHANGED = "STATUS_CHANGED"
    ASSET_UPLOADED = "ASSET_UPLOADED"
    CHALLENGE_ARCHIVED = "CHALLENGE_ARCHIVED"
    VISIBILITY_CHANGED = "VISIBILITY_CHANGED"
    # Legacy / Future actions
    PROBLEM_CREATED = "PROBLEM_CREATED"
    PROBLEM_UPDATED = "PROBLEM_UPDATED"
    PROBLEM_VERIFIED = "PROBLEM_VERIFIED"
    PROJECT_CREATED = "PROJECT_CREATED"
    PARTNERSHIP_CREATED = "PARTNERSHIP_CREATED"


class ChallengeCategory(str, enum.Enum):
    """Standardized challenge domain categories."""
    WATER = "Water"
    HEALTHCARE = "Healthcare"
    AGRICULTURE = "Agriculture"
    INFRASTRUCTURE = "Infrastructure"
    SANITATION = "Sanitation"
    EDUCATION = "Education"
    ENVIRONMENT = "Environment"
    ENERGY = "Energy"
    ACCESSIBILITY = "Accessibility"
    PUBLIC_ADMINISTRATION = "Public Administration"
    RURAL_LIVELIHOOD = "Rural Livelihood"


class ChallengeStatus(str, enum.Enum):
    """Deterministic challenge lifecycle statuses."""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    CLOSED = "closed"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class ChallengeVisibility(str, enum.Enum):
    """Challenge visibility tiers."""
    PRIVATE = "PRIVATE"
    INSTITUTION = "INSTITUTION"
    PUBLIC = "PUBLIC"
    ARCHIVED = "ARCHIVED"


class MediaType(str, enum.Enum):
    """Supported asset media types."""
    IMAGE = "image"
    VIDEO = "video"
    DOCUMENT = "document"


class NotificationType(str, enum.Enum):
    """Standardized notification types."""
    SYSTEM = "SYSTEM"
    ALERT = "ALERT"
    CHALLENGE_UPDATE = "CHALLENGE_UPDATE"
    PROJECT_UPDATE = "PROJECT_UPDATE"
    PARTNERSHIP = "PARTNERSHIP"
    IMPACT = "IMPACT"

