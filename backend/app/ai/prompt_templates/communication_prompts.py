from __future__ import annotations

from app.ai.prompt_templates.shared import STRICT_JSON_SYSTEM_PROMPT, format_context, response_shape_text


def build_communication_prompt(context: dict) -> tuple[str, str]:
    user_prompt = f"""Write a calm, compliant client communication message for the current scenario.
Preserve the scenario, playbook, risk level, actions, and explanations from the provided draft.
Only refine the client_message while keeping the response fully JSON.
Do not promise outcomes or guarantees.

Required response shape:
{response_shape_text()}

Context:
{format_context(context)}
"""
    return STRICT_JSON_SYSTEM_PROMPT, user_prompt
