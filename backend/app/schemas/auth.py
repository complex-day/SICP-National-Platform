import re
import uuid
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.core.constants import UserRole


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255, description="Full name of user")
    email: EmailStr = Field(..., description="Unique email address")
    phone: Optional[str] = Field(None, max_length=20, description="Optional phone number")
    password: str = Field(..., min_length=8, description="Password (at least 8 chars with upper, lower, number, special)")
    role: UserRole = Field(default=UserRole.CITIZEN, description="User role")
    
    # Optional role profile details
    district: Optional[str] = Field(None, max_length=150)
    state: Optional[str] = Field(None, max_length=100)
    company_name: Optional[str] = Field(None, max_length=255)
    specialization: Optional[str] = Field(None, max_length=255)
    skills: Optional[List[str]] = Field(None)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class RegisterResponseData(BaseModel):
    user_id: uuid.UUID
    message: str = "Registration successful"


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="User password")


class TokenResponseData(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 900  # 15 minutes in seconds
    role: str
    user_id: uuid.UUID
    full_name: str
    email: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid refresh token")


class RefreshTokenResponseData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 900


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New strong password")

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("New password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("New password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("New password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("New password must contain at least one special character")
        return v


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Reset verification token")
    new_password: str = Field(..., min_length=8, description="New strong password")

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("New password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("New password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("New password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("New password must contain at least one special character")
        return v
