from __future__ import annotations

from pydantic import Field

from app.models.portfolio import PortfolioAllocation, PortfolioProfile
from app.schemas.common import ResourceResponse


class PortfolioCreate(PortfolioProfile):
    pass


class PortfolioUpdate(PortfolioCreate):
    pass


class PortfolioResponse(ResourceResponse):
    client_id: str
    name: str
    total_value: float
    cash_ratio: float
    liquidity_score: int
    holdings: list[PortfolioAllocation] = Field(default_factory=list)
