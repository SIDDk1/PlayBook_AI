from __future__ import annotations

from datetime import datetime, timezone
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ScenarioType(StrEnum):
    MARKET_CRASH = "market_crash"
    SECTOR_CORRECTION = "sector_correction"
    INTEREST_RATE_CHANGE = "interest_rate_change"
    LIQUIDITY_STRESS = "liquidity_stress"
    EARNINGS_VOLATILITY = "earnings_volatility"
    GEOPOLITICAL_EVENT = "geopolitical_event"
    CREDIT_DOWNGRADE = "credit_downgrade"
    CLIENT_PANIC_SELLING = "client_panic_selling_behavior"
    PORTFOLIO_CONCENTRATION_BREACH = "portfolio_concentration_breach"


class RiskLevel(StrEnum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class ActionPriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class ApprovalStatus(StrEnum):
    DRAFT = "draft"
    PENDING = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTED = "executed"


class TimestampedModel(BaseModel):
    id: str | None = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    model_config = ConfigDict(use_enum_values=True)
