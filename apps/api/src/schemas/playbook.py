from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class PlaybookBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    trigger_conditions: Dict[str, Any] = {}
    actions: List[Dict[str, Any]] = []
    compliance_rules: Dict[str, Any] = {}
    impacted_portfolios_clients: Dict[str, Any] = {}
    risk_checks: List[Dict[str, Any]] = []
    client_communication_templates: Dict[str, Any] = {}
    guardrails: Dict[str, Any] = {}
    escalation_rules: Dict[str, Any] = {}
    approval_workflow: List[str] = []
    post_action_review_metrics: List[Dict[str, Any]] = []

class PlaybookCreate(PlaybookBase):
    pass

class PlaybookUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    trigger_conditions: Optional[Dict[str, Any]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    compliance_rules: Optional[Dict[str, Any]] = None
    impacted_portfolios_clients: Optional[Dict[str, Any]] = None
    risk_checks: Optional[List[Dict[str, Any]]] = None
    client_communication_templates: Optional[Dict[str, Any]] = None
    guardrails: Optional[Dict[str, Any]] = None
    escalation_rules: Optional[Dict[str, Any]] = None
    approval_workflow: Optional[List[str]] = None
    post_action_review_metrics: Optional[List[Dict[str, Any]]] = None

class PlaybookResponse(PlaybookBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
