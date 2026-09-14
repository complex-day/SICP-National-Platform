from typing import Any, Dict, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error description")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Optional extra error details")


class StandardResponse(BaseModel, Generic[T]):
    """Standard success response wrapper conforming strictly to SICP API rules."""
    success: bool = True
    data: T


class ErrorResponse(BaseModel):
    """Standard error response wrapper conforming strictly to SICP API rules."""
    success: bool = False
    error: ErrorDetail


class MessageData(BaseModel):
    message: str
    details: Optional[Dict[str, Any]] = None
