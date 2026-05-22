from __future__ import annotations

from pydantic import BaseModel, Field

from app.models.common import ApprovalStatus, RiskLevel, ScenarioType
from app.schemas.client import ClientResponse
from app.schemas.portfolio import PortfolioResponse


class ScenarioDetectionInput(BaseModel):
    scenario_type: ScenarioType
    title: str
    description: str
    client_records: list[ClientResponse] = Field(default_factory=list)
    portfolio_records: list[PortfolioResponse] = Field(default_factory=list)
    affected_sectors: list[str] = Field(default_factory=list)
    market_signals: list[str] = Field(default_factory=list)
    severity_hint: RiskLevel | None = None


class ScenarioDetectionResult(BaseModel):
    scenario: ScenarioType
    title: str
    confidence: float
    severity: RiskLevel
    narrative: str
    impacted_client_ids: list[str] = Field(default_factory=list)
    impacted_portfolio_ids: list[str] = Field(default_factory=list)
    signals: list[str] = Field(default_factory=list)


class PlaybookMatchCandidate(BaseModel):
    playbook_id: str
    playbook_name: str
    score: float
    reasons: list[str] = Field(default_factory=list)


class PlaybookMatchResult(BaseModel):
    selected_playbook_id: str | None = None
    selected_playbook_name: str | None = None
    confidence: float = 0.0
    candidates: list[PlaybookMatchCandidate] = Field(default_factory=list)


class RiskCheckFinding(BaseModel):
    name: str
    status: str
    detail: str


class RiskCheckResult(BaseModel):
    risk_level: RiskLevel
    requires_approval: bool
    findings: list[RiskCheckFinding] = Field(default_factory=list)
    guardrail_hits: list[str] = Field(default_factory=list)


class EscalationStep(BaseModel):
    role: str
    order: int
    reason: str
    required: bool = True


class EscalationResult(BaseModel):
    requires_escalation: bool
    approval_status: ApprovalStatus
    reasons: list[str] = Field(default_factory=list)
    reviewers: list[EscalationStep] = Field(default_factory=list)
