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
    # M3 Team Collaboration Actions
    TEAM_CREATED = "TEAM_CREATED"
    TEAM_UPDATED = "TEAM_UPDATED"
    TEAM_LOCKED = "TEAM_LOCKED"
    TEAM_UNLOCKED = "TEAM_UNLOCKED"
    TEAM_DISBANDED = "TEAM_DISBANDED"
    INVITATION_SENT = "INVITATION_SENT"
    INVITATION_ACCEPTED = "INVITATION_ACCEPTED"
    INVITATION_DECLINED = "INVITATION_DECLINED"
    INVITATION_EXPIRED = "INVITATION_EXPIRED"
    JOIN_REQUEST_SENT = "JOIN_REQUEST_SENT"
    JOIN_REQUEST_ACCEPTED = "JOIN_REQUEST_ACCEPTED"
    JOIN_REQUEST_REJECTED = "JOIN_REQUEST_REJECTED"
    JOIN_REQUEST_WITHDRAWN = "JOIN_REQUEST_WITHDRAWN"
    MEMBER_LEFT = "MEMBER_LEFT"
    MEMBER_REMOVED = "MEMBER_REMOVED"
    MEMBER_ROLE_CHANGED = "MEMBER_ROLE_CHANGED"
    LEADERSHIP_TRANSFERRED = "LEADERSHIP_TRANSFERRED"
    # Legacy / Future actions
    PROBLEM_CREATED = "PROBLEM_CREATED"
    PROBLEM_UPDATED = "PROBLEM_UPDATED"
    PROBLEM_VERIFIED = "PROBLEM_VERIFIED"
    PROJECT_CREATED = "PROJECT_CREATED"
    PARTNERSHIP_CREATED = "PARTNERSHIP_CREATED"


class TeamStatus(str, enum.Enum):
    """Deterministic team lifecycle statuses."""
    OPEN = "OPEN"             # Actively seeking members (active_contributors < max_members)
    FULL = "FULL"             # Reached maximum student contributor capacity
    LOCKED = "LOCKED"         # Recruitment closed by Leader
    DISBANDED = "DISBANDED"   # Terminated by Leader or Admin (Terminal)


class TeamVisibility(str, enum.Enum):
    """Team discoverability tiers."""
    PUBLIC = "PUBLIC"         # Discoverable in catalog, accepts join requests
    PRIVATE = "PRIVATE"       # Hidden from search, discoverable via direct link
    INVITE_ONLY = "INVITE_ONLY"  # Visible in search, inbound join requests disabled


class TeamMemberRole(str, enum.Enum):
    """Hierarchical roles within a team."""
    LEADER = "LEADER"         # Team creator / primary admin (Contributor)
    CO_LEADER = "CO_LEADER"   # Delegated team manager, max 2 (Contributor)
    MEMBER = "MEMBER"         # Active student contributor (Contributor)
    MENTOR = "MENTOR"         # Faculty/Industry advisor, max 2 (Non-contributor)


class TeamMemberStatus(str, enum.Enum):
    """Deterministic membership lifecycle statuses."""
    ACTIVE = "ACTIVE"         # Full active participating member
    INVITED = "INVITED"       # Outbound invite sent by Leader; pending recipient action
    REQUESTED = "REQUESTED"   # Inbound request sent by Student; pending Leader action
    WITHDRAWN = "WITHDRAWN"   # Join request withdrawn by applicant (Terminal)
    EXPIRED = "EXPIRED"       # Outbound invitation expired after 14 days (Terminal)
    REJECTED = "REJECTED"     # Join request rejected by Leader (Terminal)
    LEFT = "LEFT"             # Member voluntarily exited (Terminal)
    REMOVED = "REMOVED"       # Member evicted by Leader (Terminal)


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

