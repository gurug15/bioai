from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    name: str | None = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Raw password, will be hashed before saving")


class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    # This tells Pydantic to read the data from a SQLAlchemy model directly
    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str
