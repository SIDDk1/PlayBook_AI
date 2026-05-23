from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from config.database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id", ondelete="SET NULL"), nullable=True)
    playbook_id = Column(Integer, ForeignKey("playbooks.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), nullable=False, default="Pending")  # Pending, Active, Completed, Cancelled
    # context: {"advisor_reasoning": "Rebalancing due to tech drop", "portfolio_id": 5}
    context = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    scenario = relationship("Scenario", back_populates="workflows")
    playbook = relationship("Playbook", back_populates="workflows")
    approvals = relationship("Approval", back_populates="workflow", cascade="all, delete-orphan")
    communications = relationship("Communication", back_populates="workflow", cascade="all, delete-orphan")
    analytics = relationship("Analytics", back_populates="workflow", cascade="all, delete-orphan")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    approver_role = Column(String(50), nullable=False)  # RelationshipManager, RiskOfficer, ComplianceHead
    status = Column(String(30), nullable=False, default="Pending")  # Pending, Approved, Rejected
    comments = Column(String(255), nullable=True)
    actioned_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actioned_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    workflow = relationship("Workflow", back_populates="approvals")
    actioned_by = relationship("User")
