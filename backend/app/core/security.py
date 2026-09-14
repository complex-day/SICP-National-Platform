from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Set
import uuid
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing configuration (Argon2 with bcrypt fallback)
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto"
)

# In-memory revoked token registry for logout (Can be backed by Redis in distributed deployment)
revoked_tokens: Set[str] = set()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hashes a password using Argon2id/bcrypt."""
    return pwd_context.hash(password)


def create_access_token(
    subject: str,
    role: str,
    extra_claims: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Creates a short-lived JWT access token (15 mins default) with unique jti identifier."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "type": "access",
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": expire,
    }
    if extra_claims:
        to_encode.update(extra_claims)
        
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Creates a long-lived JWT refresh token (7 days default) with unique jti identifier."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "type": "refresh",
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": expire,
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token."""
    if is_token_revoked(token):
        raise jwt.InvalidTokenError("Token has been revoked")
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    return payload


def revoke_token(token: str) -> None:
    """Adds a token to the revoked set (used during logout)."""
    revoked_tokens.add(token)


def is_token_revoked(token: str) -> bool:
    """Checks whether a token is revoked."""
    return token in revoked_tokens
