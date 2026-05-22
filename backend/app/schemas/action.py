from __future__ import annotations

from pydantic import BaseModel, Field

from app.models.action import ActionRecommendation
from app.models.common import ApprovalStatus, RiskLevel
from app.schemas.common import ResourceResponse


class ActionRecordCreate(BaseModel):
    scenario_id: str
    playbook_id: str | None = None
    scenario: str
    playbook: str
    risk_level: RiskLevel
    client_ids: list[str] = Field(default_factory=list)
    portfolio_ids: list[str] = Field(default_factory=list)
    actions: list[ActionRecommendation] = Field(default_factory=list)
    explanations: list[str] = Field(default_factory=list)
    client_message: str = ""
    guardrails: list[str] = Field(default_factory=list)
    approval_status: ApprovalStatus = ApprovalStatus.DRAFT
    approvals_needed: list[str] = Field(default_factory=list)


class ActionRecordUpdate(BaseModel):
    approval_status: ApprovalStatus
    client_message: str | None = None
    execution_notes: str | None = None


class ActionRecordResponse(ResourceResponse):
    scenario_id: str
    playbook_id: str | None = None
    scenario: str
    playbook: str
    risk_level: RiskLevel
    client_ids: list[str] = Field(default_factory=list)
    portfolio_ids: list[str] = Field(default_factory=list)
    actions: list[ActionRecommendation] = Field(default_factory=list)
    explanations: list[str] = Field(default_factory=list)
    client_message: str
    guardrails: list[str] = Field(default_factory=list)
    approval_status: ApprovalStatus
    approvals_needed: list[str] = Field(default_factory=list)
    execution_notes: str | None = None
