from __future__ import annotations

from pydantic import BaseModel, Field

from app.models.common import ScenarioType


class CommunicationTemplate(BaseModel):
    channel: str
    audience: str
    subject: str
    body: str


class ApprovalWorkflowStep(BaseModel):
    role: str
    order: int
    required: bool = True
    sla_hours: int = 4


class ReviewMetric(BaseModel):
    name: str
    target: str
    description: str


class PlaybookBlueprint(BaseModel):
    name: str
    scenario_type: ScenarioType
    description: str
    trigger_conditions: list[str] = Field(default_factory=list)
    impacted_clients: list[str] = Field(default_factory=list)
    risk_checks: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)
    communication_templates: list[CommunicationTemplate] = Field(default_factory=list)
    guardrails: list[str] = Field(default_factory=list)
    escalation_rules: list[str] = Field(default_factory=list)
    approval_workflow: list[ApprovalWorkflowStep] = Field(default_factory=list)
    review_metrics: list[ReviewMetric] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
