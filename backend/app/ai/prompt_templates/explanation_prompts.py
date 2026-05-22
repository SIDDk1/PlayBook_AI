from __future__ import annotations

from app.ai.prompt_templates.shared import STRICT_JSON_SYSTEM_PROMPT, format_context, response_shape_text


def build_explanation_prompt(context: dict) -> tuple[str, str]:
    user_prompt = f"""Refine the explanation bullets for the current playbook response.
Preserve the scenario, playbook, risk level, actions, and client_message.
Return 2 to 4 concise explanation bullets that justify the recommended actions.

Required response shape:
{response_shape_text()}

Context:
{format_context(context)}
"""
    return STRICT_JSON_SYSTEM_PROMPT, user_prompt
