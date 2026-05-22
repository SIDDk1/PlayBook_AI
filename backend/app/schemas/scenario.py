from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.common import RiskLevel, ScenarioType
from app.models.scenario import MarketSignal
from app.schemas.ai import AIPlaybookResponse
from app.schemas.common import ResourceResponse
from app.schemas.engine import EscalationResult, PlaybookMatchResult, RiskCheckResult, ScenarioDetectionResult


class ScenarioCreate(BaseModel):
    title: str
    scenario_type: ScenarioType
    description: str
    trigger_source: str = "manual"
    client_ids: list[str] = Field(default_factory=list)
    portfolio_ids: list[str] = Field(default_factory=list)
    market_signals: list[MarketSignal] = Field(default_factory=list)
    affected_sectors: list[str] = Field(default_factory=list)
    region: str | None = None
    severity_hint: RiskLevel | None = None


class ScenarioUpdate(ScenarioCreate):
    pass


class ScenarioResponse(ResourceResponse):
    title: str
    scenario_type: ScenarioType
    description: str
    trigger_source: str
    client_ids: list[str] = Field(default_factory=list)
    portfolio_ids: list[str] = Field(default_factory=list)
    market_signals: list[MarketSignal] = Field(default_factory=list)
    affected_sectors: list[str] = Field(default_factory=list)
    region: str | None = None
    detected_at: datetime
    detection: ScenarioDetectionResult
    playbook_match: PlaybookMatchResult
    risk_summary: RiskCheckResult
    escalation: EscalationResult
    analysis: AIPlaybookResponse
    action_record_id: str | None = None
