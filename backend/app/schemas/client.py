from __future__ import annotations

from pydantic import Field

from app.models.client import ClientPreference, ClientProfile
from app.schemas.common import ResourceResponse


class ClientCreate(ClientProfile):
    assets_under_advice: float


class ClientUpdate(ClientCreate):
    pass


class ClientResponse(ResourceResponse):
    name: str
    segment: str
    risk_tolerance: str
    advisor_owner: str
    behavior_flags: list[str] = Field(default_factory=list)
    preferences: ClientPreference
    assets_under_advice: float
