from __future__ import annotations

from typing import Any

from app.ai.providers.base import BaseAIProvider
from app.schemas.ai import AIPlaybookResponse


class BaseAgent:
    def __init__(self, provider: BaseAIProvider) -> None:
        self.provider = provider

    async def _run_prompt(
        self,
        system_prompt: str,
        user_prompt: str,
        defaults: dict[str, Any],
    ) -> AIPlaybookResponse:
        payload = await self.provider.generate_json(
            system_prompt,
            user_prompt,
            AIPlaybookResponse.model_json_schema(),
        )
        normalized = {
            "scenario": defaults.get("scenario", ""),
            "playbook": defaults.get("playbook", ""),
            "risk_level": defaults.get("risk_level", "moderate"),
            "actions": defaults.get("actions", []),
            "explanations": defaults.get("explanations", []),
            "client_message": defaults.get("client_message", ""),
        }
        normalized.update(payload)
        return AIPlaybookResponse.model_validate(normalized)
