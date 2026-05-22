from __future__ import annotations

from app.ai.agents.base_agent import BaseAgent
from app.ai.prompt_templates.communication_prompts import build_communication_prompt
from app.schemas.ai import AIPlaybookResponse


class CommunicationAgent(BaseAgent):
    async def generate(self, context: dict, defaults: dict) -> AIPlaybookResponse:
        system_prompt, user_prompt = build_communication_prompt(context)
        return await self._run_prompt(system_prompt, user_prompt, defaults)
