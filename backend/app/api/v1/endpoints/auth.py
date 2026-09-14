from typing import Optional
from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_active_user, get_db, oauth2_scheme
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponseData,
    LoginRequest,
    TokenResponseData,
    RefreshTokenRequest,
    RefreshTokenResponseData,
    LogoutRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.schemas.common import StandardResponse, MessageData
from app.schemas.user import UserRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=StandardResponse[RegisterResponseData],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account"
)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db)
) -> StandardResponse[RegisterResponseData]:
    """Register a new citizen, student, faculty, industry, government, or admin account."""
    auth_service = AuthService(db)
    result = await auth_service.register(payload)
    return StandardResponse(success=True, data=result)


@router.post(
    "/login",
    response_model=StandardResponse[TokenResponseData],
    status_code=status.HTTP_200_OK,
    summary="User Login"
)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db)
) -> StandardResponse[TokenResponseData]:
    """Authenticate with email and password to receive JWT access and refresh tokens."""
    auth_service = AuthService(db)
    result = await auth_service.login(payload)
    return StandardResponse(success=True, data=result)


@router.post(
    "/refresh",
    response_model=StandardResponse[RefreshTokenResponseData],
    status_code=status.HTTP_200_OK,
    summary="Refresh JWT access token"
)
async def refresh_token(
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
) -> StandardResponse[RefreshTokenResponseData]:
    """Exchange a valid refresh token for a newly issued access token."""
    auth_service = AuthService(db)
    result = await auth_service.refresh(payload.refresh_token)
    return StandardResponse(success=True, data=result)


@router.get(
    "/me",
    response_model=StandardResponse[UserRead],
    status_code=status.HTTP_200_OK,
    summary="Get current user profile"
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
) -> StandardResponse[UserRead]:
    """Return authenticated user profile details and role permissions."""
    return StandardResponse(success=True, data=UserRead.model_validate(current_user))


@router.post(
    "/logout",
    response_model=StandardResponse[MessageData],
    status_code=status.HTTP_200_OK,
    summary="Revoke session tokens"
)
async def logout(
    payload: Optional[LogoutRequest] = None,
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> StandardResponse[MessageData]:
    """Invalidate access and refresh tokens upon user logout."""
    auth_service = AuthService(db)
    refresh_token_val = payload.refresh_token if payload else None
    result = await auth_service.logout(
        access_token=token,
        refresh_token=refresh_token_val,
        user_id=current_user.id
    )
    return StandardResponse(success=True, data=result)


@router.post(
    "/change-password",
    response_model=StandardResponse[MessageData],
    status_code=status.HTTP_200_OK,
    summary="Change user password"
)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> StandardResponse[MessageData]:
    """Update password with verification of existing password."""
    auth_service = AuthService(db)
    result = await auth_service.change_password(current_user, payload)
    return StandardResponse(success=True, data=result)


@router.post(
    "/forgot-password",
    response_model=StandardResponse[MessageData],
    status_code=status.HTTP_200_OK,
    summary="Request password reset"
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
) -> StandardResponse[MessageData]:
    """Request a password reset link (stub for M1)."""
    auth_service = AuthService(db)
    result = await auth_service.forgot_password(payload)
    return StandardResponse(success=True, data=result)


@router.post(
    "/reset-password",
    response_model=StandardResponse[MessageData],
    status_code=status.HTTP_200_OK,
    summary="Reset password with token"
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
) -> StandardResponse[MessageData]:
    """Reset password using the received recovery token (stub for M1)."""
    auth_service = AuthService(db)
    result = await auth_service.reset_password(payload)
    return StandardResponse(success=True, data=result)
