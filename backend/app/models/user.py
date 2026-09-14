import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.constants import UserRole, UserStatus
from app.db.base import Base, GUID, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), unique=True, index=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(500), nullable=False)
    
    role: Mapped[str] = mapped_column(
        String(30),
        default=UserRole.CITIZEN.value,
        index=True,
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default=UserStatus.ACTIVE.value,
        index=True,
        nullable=False
    )
    
    # Email verification fields
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    verification_expires: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Trust score (0-100, default 50)
    trust_score: Mapped[float] = mapped_column(Numeric(5, 2), default=50.0, nullable=False)

    # Relationships
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
