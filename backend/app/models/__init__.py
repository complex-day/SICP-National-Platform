from app.db.base import Base, TimestampMixin, GUID
from app.models.user import User, UserRole, UserStatus
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.models.role_profiles import CitizenProfile, FacultyProfile, StudentProfile, IndustryProfile
from app.models.challenge import Challenge, ChallengeAsset
from app.models.team import Team, TeamMember
from app.models.academic import (
    University,
    UniversityAdministrator,
    Department,
    FacultyAffiliation,
    AcademicIntake,
    IntakeTeamAllocation,
)

__all__ = [
    "Base",
    "TimestampMixin",
    "GUID",
    "User",
    "UserRole",
    "UserStatus",
    "AuditLog",
    "Notification",
    "CitizenProfile",
    "FacultyProfile",
    "StudentProfile",
    "IndustryProfile",
    "Challenge",
    "ChallengeAsset",
    "Team",
    "TeamMember",
    "University",
    "UniversityAdministrator",
    "Department",
    "FacultyAffiliation",
    "AcademicIntake",
    "IntakeTeamAllocation",
]


