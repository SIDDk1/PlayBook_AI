from __future__ import annotations

from app.ai.agents.base_agent import BaseAgent
from app.ai.prompt_templates.playbook_prompts import build_playbook_prompt
from app.schemas.ai import AIPlaybookResponse


class PlaybookAgent(BaseAgent):
    async def recommend(self, context: dict, defaults: dict) -> AIPlaybookResponse:
        system_prompt, user_prompt = build_playbook_prompt(context)
        return await self._run_prompt(system_prompt, user_prompt, defaults)
