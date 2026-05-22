from __future__ import annotations

from pydantic import BaseModel

from app.models.common import ActionPriority


class ActionRecommendation(BaseModel):
    title: str
    description: str
    priority: ActionPriority
    reason: str
