from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class ResourceResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
