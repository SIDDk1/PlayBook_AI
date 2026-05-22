from __future__ import annotations

from app.ai.agents.base_agent import BaseAgent
from app.ai.prompt_templates.explanation_prompts import build_explanation_prompt
from app.schemas.ai import AIPlaybookResponse


class ExplanationAgent(BaseAgent):
    async def generate(self, context: dict, defaults: dict) -> AIPlaybookResponse:
        system_prompt, user_prompt = build_explanation_prompt(context)
        return await self._run_prompt(system_prompt, user_prompt, defaults)
