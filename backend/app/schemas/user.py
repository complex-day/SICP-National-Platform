from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRead(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    status: str
    is_verified: bool
    trust_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
