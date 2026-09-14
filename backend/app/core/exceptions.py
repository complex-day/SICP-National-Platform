from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception with SICP standard error envelope support."""
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(status_code=status_code, detail=message, headers=headers)
        self.code = code
        self.message = message
        self.details = details or {}


class AuthenticationError(AppException):
    def __init__(self, message: str = "Could not validate credentials", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message,
            details=details,
            headers={"WWW-Authenticate": "Bearer"}
        )


class AuthorizationError(AppException):
    def __init__(self, message: str = "You do not have permission to perform this action", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message=message,
            details=details
        )


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=message,
            details=details
        )


class ConflictError(AppException):
    def __init__(self, message: str = "Resource already exists", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CONFLICT",
            message=message,
            details=details
        )


class ValidationException(AppException):
    def __init__(self, message: str = "Invalid input payload", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            message=message,
            details=details
        )
