from __future__ import annotations

from pydantic import BaseModel


class MarketSignal(BaseModel):
    metric: str
    value: str | float | int
    direction: str | None = None
    note: str | None = None
