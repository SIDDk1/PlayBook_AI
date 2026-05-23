from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.orm import relationship
from config.database import Base

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), index=True, nullable=False)  # e.g. "market_crash", "interest_rate_change"
    severity = Column(String(20), nullable=False, default="Warning")  # Info, Warning, Critical
    # market_data contains context telemetry: {"index_drop": -0.12, "asset_classes": ["Equity"], "indicators": {...}}
    market_data = Column(JSON, nullable=False, default=dict)
    status = Column(String(30), nullable=False, default="Active")  # Active, Resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    workflows = relationship("Workflow", back_populates="scenario")
