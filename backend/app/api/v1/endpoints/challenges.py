import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Header, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_active_user, require_roles
from app.models.user import User
from app.schemas.common import StandardResponse, MessageData
from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeStatusUpdate,
    ChallengeDetailResponse,
    ChallengeListItemResponse,
    ChallengePaginationResponse,
    ChallengeAssetResponse,
    PaginationMetadata,
    LocationSchema,
    CitizenBriefResponse,
)
from app.services.challenge_service import ChallengeService

router = APIRouter(prefix="/challenges", tags=["Challenges"])


def get_challenge_service(db: AsyncSession = Depends(get_db)) -> ChallengeService:
    return ChallengeService(db)


def _format_challenge_detail(challenge) -> ChallengeDetailResponse:
    citizen_info = None
    if challenge.citizen and challenge.creator:
        citizen_info = CitizenBriefResponse(
            user_id=challenge.citizen.user_id,
            full_name=challenge.creator.full_name,
            district=challenge.citizen.district,
            state=challenge.citizen.state,
        )

    assets_dto = [
        ChallengeAssetResponse(
            id=a.id,
            challenge_id=a.challenge_id,
            media_type=a.media_type,
            storage_url=a.storage_url,
            file_name=a.file_name,
            file_size_bytes=a.file_size_bytes,
            mime_type=a.mime_type,
            uploaded_at=a.uploaded_at,
        )
        for a in challenge.assets
    ]

    return ChallengeDetailResponse(
        id=challenge.id,
        citizen_id=challenge.citizen_id,
        created_by=challenge.created_by,
        updated_by=challenge.updated_by,
        title=challenge.title,
        description=challenge.description,
        category=challenge.category,
        subcategory=challenge.subcategory,
        affected_population=challenge.affected_population,
        location=LocationSchema(
            lat=float(challenge.latitude),
            lng=float(challenge.longitude),
            address_text=challenge.address_text,
            district=challenge.district,
            state=challenge.state,
        ),
        status=challenge.status,
        visibility=challenge.visibility,
        version=challenge.version,
        published_at=challenge.published_at,
        archived_at=challenge.archived_at,
        priority_score=challenge.priority_score,
        ai_confidence=float(challenge.ai_confidence) if challenge.ai_confidence is not None else None,
        citizen=citizen_info,
        assets=assets_dto,
        created_at=challenge.created_at,
        updated_at=challenge.updated_at,
    )


@router.post(
    "",
    response_model=StandardResponse[ChallengeDetailResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new societal challenge (draft or submitted)",
)
async def create_challenge(
    payload: ChallengeCreate,
    current_user: User = Depends(require_roles(["citizen", "admin"])),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    service: ChallengeService = Depends(get_challenge_service),
):
    challenge = await service.create_challenge(
        current_user=current_user,
        data=payload,
        idempotency_key=idempotency_key,
    )
    return StandardResponse(data=_format_challenge_detail(challenge))


@router.get(
    "/my-challenges",
    response_model=StandardResponse[ChallengePaginationResponse],
    summary="List challenges submitted by current citizen",
)
async def list_my_challenges(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_roles(["citizen", "admin"])),
    service: ChallengeService = Depends(get_challenge_service),
):
    items, total = await service.list_my_challenges(current_user=current_user, page=page, limit=limit)
    total_pages = (total + limit - 1) // limit if limit > 0 else 0

    list_items = [
        ChallengeListItemResponse(
            id=c.id,
            citizen_id=c.citizen_id,
            created_by=c.created_by,
            title=c.title,
            category=c.category,
            status=c.status,
            visibility=c.visibility,
            affected_population=c.affected_population,
            district=c.district,
            state=c.state,
            assets_count=len(c.assets),
            priority_score=c.priority_score,
            published_at=c.published_at,
            created_at=c.created_at,
        )
        for c in items
    ]

    return StandardResponse(
        data=ChallengePaginationResponse(
            items=list_items,
            pagination=PaginationMetadata(
                total=total, page=page, limit=limit, total_pages=total_pages
            ),
        )
    )


@router.get(
    "/{challenge_id}",
    response_model=StandardResponse[ChallengeDetailResponse],
    summary="Get challenge details by UUID",
)
async def get_challenge_by_id(
    challenge_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    service: ChallengeService = Depends(get_challenge_service),
):
    challenge = await service.get_challenge(challenge_id=challenge_id, current_user=current_user)
    return StandardResponse(data=_format_challenge_detail(challenge))


@router.get(
    "",
    response_model=StandardResponse[ChallengePaginationResponse],
    summary="List challenges with filters and pagination",
)
async def list_challenges(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    visibility: Optional[str] = Query(None),
    sort_by: str = Query("created_at_desc"),
    current_user: User = Depends(get_current_active_user),
    service: ChallengeService = Depends(get_challenge_service),
):
    items, total = await service.list_challenges(
        current_user=current_user,
        page=page,
        limit=limit,
        category=category,
        status=status,
        district=district,
        state=state,
        search=search,
        visibility=visibility,
        sort_by=sort_by,
    )
    total_pages = (total + limit - 1) // limit if limit > 0 else 0

    list_items = [
        ChallengeListItemResponse(
            id=c.id,
            citizen_id=c.citizen_id,
            created_by=c.created_by,
            title=c.title,
            category=c.category,
            status=c.status,
            visibility=c.visibility,
            affected_population=c.affected_population,
            district=c.district,
            state=c.state,
            assets_count=len(c.assets),
            priority_score=c.priority_score,
            published_at=c.published_at,
            created_at=c.created_at,
        )
        for c in items
    ]

    return StandardResponse(
        data=ChallengePaginationResponse(
            items=list_items,
            pagination=PaginationMetadata(
                total=total, page=page, limit=limit, total_pages=total_pages
            ),
        )
    )


@router.patch(
    "/{challenge_id}",
    response_model=StandardResponse[ChallengeDetailResponse],
    summary="Update challenge details with optimistic locking",
)
async def update_challenge(
    challenge_id: uuid.UUID,
    payload: ChallengeUpdate,
    current_user: User = Depends(get_current_active_user),
    service: ChallengeService = Depends(get_challenge_service),
):
    updated = await service.update_challenge(
        challenge_id=challenge_id, current_user=current_user, data=payload
    )
    return StandardResponse(data=_format_challenge_detail(updated))


@router.patch(
    "/{challenge_id}/status",
    response_model=StandardResponse[ChallengeDetailResponse],
    summary="Execute guarded state machine transition on challenge",
)
async def transition_challenge_status(
    challenge_id: uuid.UUID,
    payload: ChallengeStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    service: ChallengeService = Depends(get_challenge_service),
):
    updated = await service.transition_status(
        challenge_id=challenge_id, current_user=current_user, data=payload
    )
    return StandardResponse(data=_format_challenge_detail(updated))


@router.post(
    "/{challenge_id}/assets",
    response_model=StandardResponse[ChallengeAssetResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload media asset evidence to challenge",
)
async def upload_challenge_asset(
    challenge_id: uuid.UUID,
    file: UploadFile = File(...),
    media_type: str = Form(...),
    current_user: User = Depends(get_current_active_user),
    service: ChallengeService = Depends(get_challenge_service),
):
    asset = await service.upload_asset(
        challenge_id=challenge_id,
        current_user=current_user,
        upload_file=file,
        media_type=media_type,
    )
    return StandardResponse(
        data=ChallengeAssetResponse(
            id=asset.id,
            challenge_id=asset.challenge_id,
            media_type=asset.media_type,
            storage_url=asset.storage_url,
            file_name=asset.file_name,
            file_size_bytes=asset.file_size_bytes,
            mime_type=asset.mime_type,
            uploaded_at=asset.uploaded_at,
        )
    )


@router.delete(
    "/{challenge_id}",
    response_model=StandardResponse[MessageData],
    summary="Soft delete a draft challenge",
)
async def delete_challenge(
    challenge_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    service: ChallengeService = Depends(get_challenge_service),
):
    await service.delete_challenge(challenge_id=challenge_id, current_user=current_user)
    return StandardResponse(
        data=MessageData(message="Challenge deleted successfully.", details={"challenge_id": str(challenge_id)})
    )
