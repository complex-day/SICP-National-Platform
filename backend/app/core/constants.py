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
    # M4 Academic Collaboration Actions
    UNIVERSITY_REGISTERED = "UNIVERSITY_REGISTERED"
    UNIVERSITY_VERIFIED = "UNIVERSITY_VERIFIED"
    UNIVERSITY_REJECTED = "UNIVERSITY_REJECTED"
    UNIVERSITY_SUSPENDED = "UNIVERSITY_SUSPENDED"
    UNIVERSITY_UPDATED = "UNIVERSITY_UPDATED"
    UNIVERSITY_ADMIN_ASSIGNED = "UNIVERSITY_ADMIN_ASSIGNED"
    UNIVERSITY_ADMIN_REMOVED = "UNIVERSITY_ADMIN_REMOVED"
    DEPARTMENT_CREATED = "DEPARTMENT_CREATED"
    DEPARTMENT_UPDATED = "DEPARTMENT_UPDATED"
    DEPARTMENT_DELETED = "DEPARTMENT_DELETED"
    HOD_ASSIGNED = "HOD_ASSIGNED"
    FACULTY_AFFILIATION_REQUESTED = "FACULTY_AFFILIATION_REQUESTED"
    FACULTY_AFFILIATION_APPROVED = "FACULTY_AFFILIATION_APPROVED"
    FACULTY_AFFILIATION_REJECTED = "FACULTY_AFFILIATION_REJECTED"
    FACULTY_AFFILIATION_REVOKED = "FACULTY_AFFILIATION_REVOKED"
    CHALLENGE_ROUTED_TO_UNIVERSITY = "CHALLENGE_ROUTED_TO_UNIVERSITY"
    CHALLENGE_CLAIMED_BY_UNIVERSITY = "CHALLENGE_CLAIMED_BY_UNIVERSITY"
    CHALLENGE_DECLINED_BY_UNIVERSITY = "CHALLENGE_DECLINED_BY_UNIVERSITY"
    TEAM_ALLOCATED_TO_CHALLENGE = "TEAM_ALLOCATED_TO_CHALLENGE"
    FACULTY_MENTOR_ASSIGNED_TO_TEAM = "FACULTY_MENTOR_ASSIGNED_TO_TEAM"
    # M5 Innovation Project Lifecycle Actions
    PROJECT_CREATED = "PROJECT_CREATED"
    PROJECT_ROADMAP_ACTIVATED = "PROJECT_ROADMAP_ACTIVATED"
    PROJECT_METADATA_UPDATED = "PROJECT_METADATA_UPDATED"
    PROJECT_STAGE_CHANGED = "PROJECT_STAGE_CHANGED"
    PROJECT_SUSPENDED = "PROJECT_SUSPENDED"
    PROJECT_RESUMED = "PROJECT_RESUMED"
    PROJECT_TERMINATED = "PROJECT_TERMINATED"
    PROJECT_COMPLETED = "PROJECT_COMPLETED"
    MILESTONE_CREATED = "MILESTONE_CREATED"
    MILESTONE_UPDATED = "MILESTONE_UPDATED"
    MILESTONE_SUBMITTED = "MILESTONE_SUBMITTED"
    MILESTONE_REVIEW_COMPLETED = "MILESTONE_REVIEW_COMPLETED"
    MILESTONE_APPROVED = "MILESTONE_APPROVED"
    DELIVERABLE_UPLOADED = "DELIVERABLE_UPLOADED"
    PROJECT_UPDATE_POSTED = "PROJECT_UPDATE_POSTED"
    # Legacy / Future actions
    PROBLEM_CREATED = "PROBLEM_CREATED"
    PROBLEM_UPDATED = "PROBLEM_UPDATED"
    PROBLEM_VERIFIED = "PROBLEM_VERIFIED"
    PARTNERSHIP_CREATED = "PARTNERSHIP_CREATED"


class ProjectStatus(str, enum.Enum):
    """Innovation project lifecycle states."""
    PROPOSAL = "PROPOSAL"
    ACTIVE = "ACTIVE"
    PROTOTYPE = "PROTOTYPE"
    PILOT = "PILOT"
    REVIEW_READY = "REVIEW_READY"
    COMPLETED = "COMPLETED"
    SUSPENDED = "SUSPENDED"
    TERMINATED = "TERMINATED"
    ABANDONED = "ABANDONED"


class ProjectStage(str, enum.Enum):
    """Innovation project engineering progression stages."""
    CONCEPT_RESEARCH = "CONCEPT_RESEARCH"
    DESIGN_ARCHITECTURE = "DESIGN_ARCHITECTURE"
    PROTOTYPE_DEVELOPMENT = "PROTOTYPE_DEVELOPMENT"
    LAB_VALIDATION = "LAB_VALIDATION"
    FIELD_PILOT = "FIELD_PILOT"
    FINAL_EVALUATION = "FINAL_EVALUATION"


class ProjectOutcome(str, enum.Enum):
    """Innovation project final evaluation outcome (for M7 analytics)."""
    SUCCESS = "SUCCESS"
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"
    FAILED = "FAILED"
    ABANDONED = "ABANDONED"


class MilestoneStatus(str, enum.Enum):
    """Milestone evaluation lifecycle statuses."""
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class DeliverableType(str, enum.Enum):
    """Supported deliverable artifact classifications."""
    CODE_REPOSITORY = "CODE_REPOSITORY"
    DOCUMENTATION = "DOCUMENTATION"
    PROTOTYPE_DEMO = "PROTOTYPE_DEMO"
    TEST_REPORT = "TEST_REPORT"
    DATASET = "DATASET"
    DEPLOYMENT_PROOF = "DEPLOYMENT_PROOF"


class ReviewDecision(str, enum.Enum):
    """Review evaluation decisions."""
    APPROVED = "APPROVED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    REJECTED = "REJECTED"


class UpdateType(str, enum.Enum):
    """Sprint progress telemetry and blocker classifications."""
    SPRINT_LOG = "SPRINT_LOG"
    BLOCKER = "BLOCKER"
    LAB_NOTE = "LAB_NOTE"
    GENERAL_ANNOUNCEMENT = "GENERAL_ANNOUNCEMENT"



class UniversityStatus(str, enum.Enum):
    """University institutional onboarding and verification statuses."""
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    VERIFIED = "VERIFIED"
    SUSPENDED = "SUSPENDED"
    REJECTED = "REJECTED"


class AffiliationStatus(str, enum.Enum):
    """Faculty department affiliation lifecycle statuses."""
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    REJECTED = "REJECTED"
    REVOKED = "REVOKED"


class IntakeStatus(str, enum.Enum):
    """Academic challenge intake and adoption statuses."""
    ROUTED = "ROUTED"
    ACCEPTED = "ACCEPTED"
    ASSIGNED = "ASSIGNED"
    DECLINED = "DECLINED"
    COMPLETED = "COMPLETED"


class IntakeType(str, enum.Enum):
    """Mechanism of challenge adoption."""
    AI_MATCHED = "AI_MATCHED"
    DIRECT_CLAIM = "DIRECT_CLAIM"
    ADMIN_ASSIGNED = "ADMIN_ASSIGNED"


class TeamAllocationStatus(str, enum.Enum):
    """Academic challenge team allocation status."""
    ALLOCATED = "ALLOCATED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    REMOVED = "REMOVED"


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

