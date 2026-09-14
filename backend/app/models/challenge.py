import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Integer, Text, Numeric, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID, TimestampMixin


class Challenge(Base, TimestampMixin):
    __tablename__ = "challenges"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    citizen_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("citizens.user_id", ondelete="RESTRICT"), nullable=False, index=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    subcategory: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    affected_population: Mapped[int] = mapped_column(Integer, nullable=False)

    # Coordinates & Location
    latitude: Mapped[float] = mapped_column(Numeric(10, 8), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(11, 8), nullable=False)
    address_text: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(150), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)

    # State, Visibility, and Optimistic Locking
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False, index=True)
    visibility: Mapped[str] = mapped_column(String(20), default="PUBLIC", nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Placeholders for M3 AI Engine
    priority_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    ai_confidence: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)

    # Relationships
    assets: Mapped[List["ChallengeAsset"]] = relationship(
        "ChallengeAsset", back_populates="challenge", cascade="all, delete-orphan", lazy="selectin"
    )
    citizen: Mapped["CitizenProfile"] = relationship("CitizenProfile", lazy="selectin")
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by], lazy="selectin")


class ChallengeAsset(Base):
    __tablename__ = "challenge_assets"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    media_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    storage_url: Mapped[str] = mapped_column(Text, nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="assets")
