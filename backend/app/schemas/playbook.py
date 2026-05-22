from __future__ import annotations

from pydantic import Field

from app.models.common import ScenarioType
from app.models.playbook import (
    ApprovalWorkflowStep,
    CommunicationTemplate,
    PlaybookBlueprint,
    ReviewMetric,
)
from app.schemas.common import ResourceResponse


class PlaybookCreate(PlaybookBlueprint):
    pass


class PlaybookUpdate(PlaybookBlueprint):
    pass


class PlaybookResponse(ResourceResponse):
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
