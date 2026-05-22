from __future__ import annotations

from pydantic import BaseModel, Field


class PortfolioAllocation(BaseModel):
    asset_name: str
    sector: str
    weight_pct: float
    liquidity_tier: str = "medium"
    credit_rating: str | None = None


class PortfolioProfile(BaseModel):
    client_id: str
    name: str
    total_value: float
    cash_ratio: float
    liquidity_score: int
    holdings: list[PortfolioAllocation] = Field(default_factory=list)
