import uuid
from typing import Optional, List, Tuple, Dict, Any
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.challenge import Challenge, ChallengeAsset
from app.models.user import User
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate, ChallengeStatusUpdate
from app.repositories.challenge_repository import ChallengeRepository
from app.repositories.audit_repository import AuditRepository
from app.services.storage_service import BaseStorageService, LocalStorageService
from app.core.constants import ChallengeStatus, ChallengeVisibility, AuditAction, UserRole
from app.core.exceptions import (
    NotFoundError,
    AuthorizationError,
    InvalidStateTransitionError,
    MaxAssetsExceededError,
    ValidationException,
)

# Deterministic State Machine Transitions
VALID_TRANSITIONS: Dict[str, set] = {
    "draft": {"submitted", "archived"},
    "submitted": {"under_review", "rejected", "archived"},
    "under_review": {"approved", "rejected", "submitted"},
    "approved": {"published", "archived"},
    "published": {"closed", "archived"},
    "closed": {"archived"},
    "rejected": set(),  # Terminal
    "archived": set(),  # Terminal
}

# In-memory Idempotency Cache for double submission prevention
_idempotency_cache: Dict[str, uuid.UUID] = {}


class ChallengeService:
    def __init__(
        self,
        db: AsyncSession,
        storage_service: Optional[BaseStorageService] = None,
    ):
        self.db = db
        self.repo = ChallengeRepository(db)
        self.audit = AuditRepository(db)
        self.storage = storage_service or LocalStorageService()

    async def create_challenge(
        self,
        current_user: User,
        data: ChallengeCreate,
        idempotency_key: Optional[str] = None,
    ) -> Challenge:
        # Check idempotency
        if idempotency_key and idempotency_key in _idempotency_cache:
            existing_id = _idempotency_cache[idempotency_key]
            existing = await self.repo.get_by_id(existing_id)
            if existing:
                return existing

        # Check role permission
        if current_user.role not in [UserRole.CITIZEN.value, UserRole.ADMIN.value]:
            raise AuthorizationError("Only citizens and administrators can create challenges.")

        initial_status = data.status or ChallengeStatus.DRAFT.value
        initial_visibility = data.visibility or ChallengeVisibility.PUBLIC.value

        challenge = Challenge(
            id=uuid.uuid4(),
            citizen_id=current_user.id,
            created_by=current_user.id,
            title=data.title,
            description=data.description,
            category=data.category,
            subcategory=data.subcategory,
            affected_population=data.affected_population,
            latitude=data.location.lat,
            longitude=data.location.lng,
            address_text=data.location.address_text,
            district=data.location.district,
            state=data.location.state,
            status=initial_status,
            visibility=initial_visibility,
            version=1,
        )

        created = await self.repo.create(challenge)

        # Increment citizen report counter
        await self.repo.increment_citizen_reports(current_user.id)

        # Audit log
        await self.audit.log(
            action=AuditAction.CHALLENGE_CREATED.value,
            entity_type="challenge",
            entity_id=created.id,
            user_id=current_user.id,
            metadata={
                "challenge_id": str(created.id),
                "title": created.title,
                "category": created.category,
                "status": created.status,
            },
        )

        if idempotency_key:
            _idempotency_cache[idempotency_key] = created.id

        await self.db.commit()
        return created

    async def get_challenge(self, challenge_id: uuid.UUID, current_user: Optional[User] = None) -> Challenge:
        challenge = await self.repo.get_by_id(challenge_id)
        if not challenge:
            raise NotFoundError(f"Challenge with ID {challenge_id} not found.")

        # Access check for private drafts
        if challenge.status == ChallengeStatus.DRAFT.value:
            if not current_user:
                raise AuthorizationError("Authentication required to view draft challenges.")
            if current_user.id != challenge.created_by and current_user.role != UserRole.ADMIN.value:
                raise AuthorizationError("You do not have permission to view this draft challenge.")

        return challenge

    async def list_challenges(
        self,
        current_user: Optional[User] = None,
        page: int = 1,
        limit: int = 20,
        category: Optional[str] = None,
        status: Optional[str] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        search: Optional[str] = None,
        visibility: Optional[str] = None,
        sort_by: str = "created_at_desc",
    ) -> Tuple[List[Challenge], int]:
        return await self.repo.list_challenges(
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

    async def list_my_challenges(
        self, current_user: User, page: int = 1, limit: int = 20
    ) -> Tuple[List[Challenge], int]:
        return await self.repo.list_by_author(current_user.id, page=page, limit=limit)

    async def update_challenge(
        self,
        challenge_id: uuid.UUID,
        current_user: User,
        data: ChallengeUpdate,
    ) -> Challenge:
        challenge = await self.repo.get_by_id(challenge_id)
        if not challenge:
            raise NotFoundError(f"Challenge with ID {challenge_id} not found.")

        # Ownership authorization
        is_author = challenge.created_by == current_user.id
        is_admin = current_user.role == UserRole.ADMIN.value

        if not is_author and not is_admin:
            raise AuthorizationError("You do not have permission to edit this challenge.")

        if is_author and not is_admin:
            if challenge.status not in [ChallengeStatus.DRAFT.value, ChallengeStatus.SUBMITTED.value]:
                raise ValidationException(f"Cannot edit challenge in '{challenge.status}' status.")

        update_dict: Dict[str, Any] = {}
        if data.title is not None:
            update_dict["title"] = data.title
        if data.description is not None:
            update_dict["description"] = data.description
        if data.category is not None:
            update_dict["category"] = data.category
        if data.subcategory is not None:
            update_dict["subcategory"] = data.subcategory
        if data.affected_population is not None:
            update_dict["affected_population"] = data.affected_population
        if data.location is not None:
            update_dict["latitude"] = data.location.lat
            update_dict["longitude"] = data.location.lng
            if data.location.address_text is not None:
                update_dict["address_text"] = data.location.address_text
            if data.location.district is not None:
                update_dict["district"] = data.location.district
            if data.location.state is not None:
                update_dict["state"] = data.location.state

        visibility_changed = False
        old_visibility = challenge.visibility
        if data.visibility is not None and data.visibility != challenge.visibility:
            update_dict["visibility"] = data.visibility
            visibility_changed = True

        updated = await self.repo.update_fields(
            challenge_id=challenge_id,
            expected_version=data.version,
            user_id=current_user.id,
            update_data=update_dict,
        )

        # Audit log for challenge update
        await self.audit.log(
            action=AuditAction.CHALLENGE_UPDATED.value,
            entity_type="challenge",
            entity_id=challenge_id,
            user_id=current_user.id,
            metadata={"challenge_id": str(challenge_id), "version": updated.version},
        )

        if visibility_changed:
            await self.audit.log(
                action=AuditAction.VISIBILITY_CHANGED.value,
                entity_type="challenge",
                entity_id=challenge_id,
                user_id=current_user.id,
                metadata={
                    "challenge_id": str(challenge_id),
                    "old_visibility": old_visibility,
                    "new_visibility": data.visibility,
                },
            )

        await self.db.commit()
        return updated

    async def transition_status(
        self,
        challenge_id: uuid.UUID,
        current_user: User,
        data: ChallengeStatusUpdate,
    ) -> Challenge:
        challenge = await self.repo.get_by_id(challenge_id)
        if not challenge:
            raise NotFoundError(f"Challenge with ID {challenge_id} not found.")

        current_status = challenge.status
        target_status = data.status

        # 1. State Machine Validation
        allowed_targets = VALID_TRANSITIONS.get(current_status, set())
        if target_status not in allowed_targets:
            raise InvalidStateTransitionError(
                f"Transition from '{current_status}' to '{target_status}' is not allowed."
            )

        # 2. Role Ownership & Authorization Check
        is_author = challenge.created_by == current_user.id
        is_evaluator = current_user.role == UserRole.FACULTY.value
        is_admin = current_user.role == UserRole.ADMIN.value

        # Enforce transition permissions per role
        if current_status == "draft" and target_status in ("submitted", "archived"):
            if not is_author and not is_admin:
                raise AuthorizationError("Only the author or an admin can submit or archive a draft.")

        elif current_status == "submitted" and target_status in ("under_review", "rejected"):
            if not is_evaluator and not is_admin:
                raise AuthorizationError("Only evaluators or administrators can review or reject submissions.")

        elif current_status == "submitted" and target_status == "archived":
            if not is_author and not is_admin:
                raise AuthorizationError("Only the author or an admin can archive a submitted challenge.")

        elif current_status == "under_review" and target_status in ("approved", "rejected", "submitted"):
            if not is_evaluator and not is_admin:
                raise AuthorizationError("Only evaluators or administrators can approve or request revisions.")

        elif current_status == "approved" and target_status == "published":
            if not is_admin and not is_evaluator:
                raise AuthorizationError("Only administrators or evaluators can publish an approved challenge.")

        elif target_status in ("closed", "archived"):
            if not is_admin and not (is_author and current_status in ("draft", "submitted")):
                raise AuthorizationError("You do not have permission to close or archive this challenge.")

        updated = await self.repo.update_status(
            challenge_id=challenge_id,
            expected_version=data.version,
            target_status=target_status,
            user_id=current_user.id,
        )

        # Audit log
        action_name = (
            AuditAction.CHALLENGE_ARCHIVED.value
            if target_status == "archived"
            else AuditAction.STATUS_CHANGED.value
        )
        await self.audit.log(
            action=action_name,
            entity_type="challenge",
            entity_id=challenge_id,
            user_id=current_user.id,
            metadata={
                "challenge_id": str(challenge_id),
                "previous_status": current_status,
                "new_status": target_status,
                "reason": data.reason,
            },
        )

        await self.db.commit()
        return updated

    async def upload_asset(
        self,
        challenge_id: uuid.UUID,
        current_user: User,
        upload_file: UploadFile,
        media_type: str,
    ) -> ChallengeAsset:
        challenge = await self.repo.get_by_id(challenge_id)
        if not challenge:
            raise NotFoundError(f"Challenge with ID {challenge_id} not found.")

        # Permission check
        is_author = challenge.created_by == current_user.id
        is_admin = current_user.role == UserRole.ADMIN.value
        if not is_author and not is_admin:
            raise AuthorizationError("You do not have permission to upload assets for this challenge.")

        # Asset limit check (max 5)
        count = await self.repo.count_assets(challenge_id)
        if count >= 5:
            raise MaxAssetsExceededError("Maximum number of assets (5) reached for this challenge.")

        # Upload file via storage abstraction
        destination_folder = f"challenges/{challenge_id}"
        storage_url, file_name, file_size_bytes, mime_type = await self.storage.upload_file(
            upload_file=upload_file,
            media_type=media_type,
            destination_folder=destination_folder,
        )

        asset = ChallengeAsset(
            id=uuid.uuid4(),
            challenge_id=challenge_id,
            created_by=current_user.id,
            media_type=media_type,
            storage_url=storage_url,
            file_name=file_name,
            file_size_bytes=file_size_bytes,
            mime_type=mime_type,
        )
        created_asset = await self.repo.add_asset(asset)

        # Audit log
        await self.audit.log(
            action=AuditAction.ASSET_UPLOADED.value,
            entity_type="challenge_asset",
            entity_id=created_asset.id,
            user_id=current_user.id,
            metadata={
                "challenge_id": str(challenge_id),
                "asset_id": str(created_asset.id),
                "media_type": media_type,
                "file_size_bytes": file_size_bytes,
            },
        )

        await self.db.commit()
        return created_asset

    async def delete_challenge(self, challenge_id: uuid.UUID, current_user: User) -> bool:
        challenge = await self.repo.get_by_id(challenge_id)
        if not challenge:
            raise NotFoundError(f"Challenge with ID {challenge_id} not found.")

        is_author = challenge.created_by == current_user.id
        is_admin = current_user.role == UserRole.ADMIN.value

        if not is_author and not is_admin:
            raise AuthorizationError("You do not have permission to delete this challenge.")

        if is_author and not is_admin:
            if challenge.status != ChallengeStatus.DRAFT.value:
                raise ValidationException("Only draft challenges can be deleted by the author.")

        success = await self.repo.soft_delete(challenge_id, current_user.id)

        await self.audit.log(
            action=AuditAction.CHALLENGE_ARCHIVED.value,
            entity_type="challenge",
            entity_id=challenge_id,
            user_id=current_user.id,
            metadata={"challenge_id": str(challenge_id), "action": "soft_deleted"},
        )

        await self.db.commit()
        return success
