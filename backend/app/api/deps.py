from typing import List, Callable
import uuid
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import security
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.db.session import get_db
from app.models.user import User, UserRole, UserStatus
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to retrieve and validate the authenticated user from the JWT Bearer token."""
    if not token:
        raise AuthenticationError(message="Authentication credentials were not provided")

    try:
        payload = security.decode_token(token)
    except jwt.ExpiredSignatureError:
        raise AuthenticationError(message="Token has expired")
    except jwt.InvalidTokenError as e:
        raise AuthenticationError(message=f"Invalid token: {str(e)}")
    except Exception:
        raise AuthenticationError(message="Could not validate credentials")

    token_type = payload.get("type")
    if token_type != "access":
        raise AuthenticationError(message="Token is not an access token")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise AuthenticationError(message="Token payload invalid")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise AuthenticationError(message="Invalid user ID format in token")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise AuthenticationError(message="User not found")

    if user.status == UserStatus.BANNED.value:
        raise AuthorizationError(message="User account has been banned")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure current user account is active."""
    if current_user.status != UserStatus.ACTIVE.value:
        raise AuthorizationError(message="Account is not active")
    return current_user


def require_roles(allowed_roles: List[str]) -> Callable:
    """RBAC dependency factory. Admin always has full access."""
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        # Admin bypasses specific role restrictions
        if current_user.role == UserRole.ADMIN.value:
            return current_user
        if current_user.role not in allowed_roles:
            raise AuthorizationError(
                message=f"Access forbidden: requires one of the following roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker
