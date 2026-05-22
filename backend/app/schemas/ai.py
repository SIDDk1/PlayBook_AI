from __future__ import annotations

from pydantic import BaseModel, Field

from app.models.action import ActionRecommendation
from app.models.common import RiskLevel


class AIPlaybookResponse(BaseModel):
    scenario: str
    playbook: str
    risk_level: RiskLevel
    actions: list[ActionRecommendation] = Field(default_factory=list)
    explanations: list[str] = Field(default_factory=list)
    client_message: str
