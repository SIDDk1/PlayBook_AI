from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.orm import relationship
from config.database import Base

class Playbook(Base):
    __tablename__ = "playbooks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(String(255), nullable=True)
    category = Column(String(50), nullable=True, index=True)
    # trigger_conditions: {"type": "market_crash", "index_drop_threshold": -0.10, "risk_level": "Aggressive"}
    trigger_conditions = Column(JSON, nullable=False, default=dict)
    # actions: [{"step": 1, "action_type": "rebalance", "params": {"sell": "Equities", "buy": "Bonds"}}]
    actions = Column(JSON, nullable=False, default=list)
    # compliance_rules: {"restricted_asset_classes": ["Cryptocurrency"], "requires_escalation": true}
    compliance_rules = Column(JSON, nullable=False, default=dict)
    impacted_portfolios_clients = Column(JSON, nullable=False, default=dict)
    risk_checks = Column(JSON, nullable=False, default=list)
    client_communication_templates = Column(JSON, nullable=False, default=dict)
    guardrails = Column(JSON, nullable=False, default=dict)
    escalation_rules = Column(JSON, nullable=False, default=dict)
    approval_workflow = Column(JSON, nullable=False, default=list)
    post_action_review_metrics = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    workflows = relationship("Workflow", back_populates="playbook")
