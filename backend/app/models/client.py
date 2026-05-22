from __future__ import annotations

from pydantic import BaseModel, Field


class ClientPreference(BaseModel):
    communication_channel: str = "email"
    preferred_contact_time: str = "business_hours"


class ClientProfile(BaseModel):
    name: str
    segment: str
    risk_tolerance: str
    advisor_owner: str
    behavior_flags: list[str] = Field(default_factory=list)
    preferences: ClientPreference = Field(default_factory=ClientPreference)
