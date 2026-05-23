from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class PermissionBase(BaseModel):
    name: str
    code: str

class PermissionResponse(PermissionBase):
    id: int
    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleResponse(RoleBase):
    id: int
    permissions: List[PermissionResponse] = []
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_name: Optional[str] = "RelationshipManager"  # Default role

class UserResponse(UserBase):
    id: int
    is_active: bool
    role: Optional[RoleResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
