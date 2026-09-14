from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import security
from app.core.exceptions import (
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ValidationException,
)
from app.models.user import User, UserStatus
from app.repositories.user_repository import UserRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponseData,
    LoginRequest,
    TokenResponseData,
    RefreshTokenResponseData,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.schemas.common import MessageData


class AuthService:
    """Service layer coordinating user authentication, authorization, and audit logging."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.audit_repo = AuditRepository(session)

    async def register(self, payload: RegisterRequest) -> RegisterResponseData:
        """Register a new user and initialize role-specific profile."""
        existing_user = await self.user_repo.get_by_email(payload.email)
        if existing_user:
            raise ConflictError(
                message="An account with this email already exists",
                details={"email": payload.email}
            )

        if payload.phone:
            existing_phone = await self.user_repo.get_by_phone(payload.phone)
            if existing_phone:
                raise ConflictError(
                    message="An account with this phone number already exists",
                    details={"phone": payload.phone}
                )

        hashed_password = security.get_password_hash(payload.password)

        user = await self.user_repo.create(
            full_name=payload.full_name,
            email=payload.email,
            password_hash=hashed_password,
            role=payload.role.value,
            phone=payload.phone,
            status=UserStatus.ACTIVE.value
        )

        # Create role-specific profile
        profile_data = {
            "district": payload.district,
            "state": payload.state,
            "company_name": payload.company_name,
            "specialization": payload.specialization,
            "skills": payload.skills,
        }
        await self.user_repo.create_role_profile(user.id, user.role, profile_data)

        # Audit log
        await self.audit_repo.log(
            action="USER_REGISTERED",
            entity_type="users",
            user_id=user.id,
            entity_id=user.id,
            metadata={"role": user.role, "email": user.email}
        )

        return RegisterResponseData(
            user_id=user.id,
            message="Registration successful"
        )

    async def login(self, payload: LoginRequest) -> TokenResponseData:
        """Authenticate user and issue JWT access & refresh tokens."""
        user = await self.user_repo.get_by_email(payload.email)
        if not user:
            raise AuthenticationError(message="Invalid email or password")

        if not security.verify_password(payload.password, user.password_hash):
            await self.audit_repo.log(
                action="LOGIN_FAILED",
                entity_type="users",
                user_id=user.id,
                entity_id=user.id,
                metadata={"reason": "incorrect_password"}
            )
            raise AuthenticationError(message="Invalid email or password")

        if user.status == UserStatus.BANNED.value:
            raise AuthorizationError(message="Your account has been banned due to policy violations.")

        if user.status == UserStatus.SUSPENDED.value:
            raise AuthorizationError(message="Your account is temporarily suspended.")

        # Create JWT tokens
        access_token = security.create_access_token(
            subject=str(user.id),
            role=user.role,
            extra_claims={"email": user.email, "name": user.full_name}
        )
        refresh_token = security.create_refresh_token(subject=str(user.id))

        await self.audit_repo.log(
            action="LOGIN_SUCCESS",
            entity_type="users",
            user_id=user.id,
            entity_id=user.id
        )

        return TokenResponseData(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=security.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            role=user.role,
            user_id=user.id,
            full_name=user.full_name,
            email=user.email
        )

    async def refresh(self, refresh_token: str) -> RefreshTokenResponseData:
        """Issue a new access token given a valid refresh token."""
        try:
            payload = security.decode_token(refresh_token)
        except Exception:
            raise AuthenticationError(message="Invalid or expired refresh token")

        if payload.get("type") != "refresh":
            raise AuthenticationError(message="Token is not a refresh token")

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise AuthenticationError(message="Invalid token claims")

        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise AuthenticationError(message="Invalid user ID format in token")

        user = await self.user_repo.get_by_id(user_id)
        if not user or user.status == UserStatus.BANNED.value:
            raise AuthenticationError(message="User not found or account inactive")

        new_access_token = security.create_access_token(
            subject=str(user.id),
            role=user.role,
            extra_claims={"email": user.email, "name": user.full_name}
        )

        return RefreshTokenResponseData(
            access_token=new_access_token,
            token_type="bearer",
            expires_in=security.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    async def logout(self, access_token: str, refresh_token: Optional[str] = None, user_id: Optional[uuid.UUID] = None) -> MessageData:
        """Revoke tokens and record logout in audit log."""
        if access_token:
            security.revoke_token(access_token)
        if refresh_token:
            security.revoke_token(refresh_token)

        if user_id:
            await self.audit_repo.log(
                action="USER_LOGOUT",
                entity_type="users",
                user_id=user_id,
                entity_id=user_id
            )

        return MessageData(message="Logged out successfully")

    async def change_password(self, user: User, payload: ChangePasswordRequest) -> MessageData:
        """Update password after verifying the current password."""
        if not security.verify_password(payload.current_password, user.password_hash):
            raise ValidationException(message="Current password does not match")

        new_hash = security.get_password_hash(payload.new_password)
        await self.user_repo.update(user, {"password_hash": new_hash})

        await self.audit_repo.log(
            action="PASSWORD_CHANGED",
            entity_type="users",
            user_id=user.id,
            entity_id=user.id
        )

        return MessageData(message="Password changed successfully")

    async def forgot_password(self, payload: ForgotPasswordRequest) -> MessageData:
        """Initiate password recovery flow (stub for M1)."""
        user = await self.user_repo.get_by_email(payload.email)
        if user:
            # Generate verification token
            token = str(uuid.uuid4())
            await self.user_repo.update(user, {
                "verification_token": token,
                "verification_expires": datetime.now(timezone.utc) + timedelta(hours=1)
            })
            await self.audit_repo.log(
                action="PASSWORD_RESET_REQUESTED",
                entity_type="users",
                user_id=user.id,
                entity_id=user.id
            )

        return MessageData(message="If this email is registered, a password reset link has been sent.")

    async def reset_password(self, payload: ResetPasswordRequest) -> MessageData:
        """Reset password using verification token (stub for M1)."""
        # For M1 stub, reject if token is empty, otherwise succeed
        if not payload.token or len(payload.token) < 10:
            raise ValidationException(message="Invalid or expired reset token")

        return MessageData(message="Password has been reset successfully.")
