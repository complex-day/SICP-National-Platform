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
    # Future M2-M7 actions reserved
    PROBLEM_CREATED = "PROBLEM_CREATED"
    PROBLEM_UPDATED = "PROBLEM_UPDATED"
    PROBLEM_VERIFIED = "PROBLEM_VERIFIED"
    PROJECT_CREATED = "PROJECT_CREATED"
    PARTNERSHIP_CREATED = "PARTNERSHIP_CREATED"


class NotificationType(str, enum.Enum):
    """Standardized notification types."""
    SYSTEM = "SYSTEM"
    ALERT = "ALERT"
    CHALLENGE_UPDATE = "CHALLENGE_UPDATE"
    PROJECT_UPDATE = "PROJECT_UPDATE"
    PARTNERSHIP = "PARTNERSHIP"
    IMPACT = "IMPACT"
