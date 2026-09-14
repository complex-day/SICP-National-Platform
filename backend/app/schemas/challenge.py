import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from app.core.constants import ChallengeCategory, ChallengeStatus, ChallengeVisibility, MediaType


class LocationSchema(BaseModel):
    lat: float = Field(..., description="Latitude coordinate between -90 and 90")
    lng: float = Field(..., description="Longitude coordinate between -180 and 180")
    address_text: Optional[str] = Field(None, max_length=255)
    district: Optional[str] = Field(None, max_length=150)
    state: Optional[str] = Field(None, max_length=100)

    @field_validator("lat")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        if not (-90.0 <= v <= 90.0):
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("lng")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        if not (-180.0 <= v <= 180.0):
            raise ValueError("Longitude must be between -180 and 180")
        return v


class ChallengeCreate(BaseModel):
    title: str = Field(..., min_length=10, max_length=500, description="Concise summary of the challenge")
    description: str = Field(..., min_length=30, max_length=5000, description="Detailed problem background and description")
    category: str = Field(..., description="Standardized category taxonomy")
    subcategory: Optional[str] = Field(None, max_length=100)
    affected_population: int = Field(..., gt=0, le=10000000, description="Estimated population impacted")
    location: LocationSchema
    status: Optional[str] = Field(default=ChallengeStatus.DRAFT.value)
    visibility: Optional[str] = Field(default=ChallengeVisibility.PUBLIC.value)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        valid_categories = [c.value for c in ChallengeCategory]
        if v not in valid_categories:
            raise ValueError(f"Category '{v}' is invalid. Must be one of {valid_categories}")
        return v

    @field_validator("visibility")
    @classmethod
    def validate_visibility(cls, v: str) -> str:
        valid_vis = [vis.value for vis in ChallengeVisibility]
        if v not in valid_vis:
            raise ValueError(f"Visibility '{v}' is invalid. Must be one of {valid_vis}")
        return v


class ChallengeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=10, max_length=500)
    description: Optional[str] = Field(None, min_length=30, max_length=5000)
    category: Optional[str] = None
    subcategory: Optional[str] = Field(None, max_length=100)
    affected_population: Optional[int] = Field(None, gt=0, le=10000000)
    location: Optional[LocationSchema] = None
    visibility: Optional[str] = None
    version: int = Field(..., description="Expected current version for optimistic locking")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_categories = [c.value for c in ChallengeCategory]
            if v not in valid_categories:
                raise ValueError(f"Category '{v}' is invalid. Must be one of {valid_categories}")
        return v

    @field_validator("visibility")
    @classmethod
    def validate_visibility(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_vis = [vis.value for vis in ChallengeVisibility]
            if v not in valid_vis:
                raise ValueError(f"Visibility '{v}' is invalid. Must be one of {valid_vis}")
        return v


class ChallengeStatusUpdate(BaseModel):
    status: str = Field(..., description="Target lifecycle state")
    version: int = Field(..., description="Expected current version for optimistic locking")
    reason: Optional[str] = Field(None, max_length=1000, description="Reason for status transition")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = [s.value for s in ChallengeStatus]
        if v not in valid_statuses:
            raise ValueError(f"Status '{v}' is invalid. Must be one of {valid_statuses}")
        return v


class ChallengeAssetResponse(BaseModel):
    id: uuid.UUID
    challenge_id: uuid.UUID
    media_type: str
    storage_url: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    uploaded_at: datetime


class CitizenBriefResponse(BaseModel):
    user_id: uuid.UUID
    full_name: str
    district: Optional[str] = None
    state: Optional[str] = None


class ChallengeDetailResponse(BaseModel):
    id: uuid.UUID
    citizen_id: uuid.UUID
    created_by: uuid.UUID
    updated_by: Optional[uuid.UUID] = None
    title: str
    description: str
    category: str
    subcategory: Optional[str] = None
    affected_population: int
    location: LocationSchema
    status: str
    visibility: str
    version: int
    published_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None
    priority_score: Optional[int] = None
    ai_confidence: Optional[float] = None
    citizen: Optional[CitizenBriefResponse] = None
    assets: List[ChallengeAssetResponse] = []
    created_at: datetime
    updated_at: datetime


class ChallengeListItemResponse(BaseModel):
    id: uuid.UUID
    citizen_id: uuid.UUID
    created_by: uuid.UUID
    title: str
    category: str
    status: str
    visibility: str
    affected_population: int
    district: Optional[str] = None
    state: Optional[str] = None
    assets_count: int = 0
    priority_score: Optional[int] = None
    published_at: Optional[datetime] = None
    created_at: datetime


class PaginationMetadata(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int


class ChallengePaginationResponse(BaseModel):
    items: List[ChallengeListItemResponse]
    pagination: PaginationMetadata
