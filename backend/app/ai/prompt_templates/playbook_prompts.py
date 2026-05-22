from __future__ import annotations

from app.ai.prompt_templates.shared import STRICT_JSON_SYSTEM_PROMPT, format_context, response_shape_text


def build_playbook_prompt(context: dict) -> tuple[str, str]:
    user_prompt = f"""Select the best response playbook for the scenario.
Prioritize the candidate with the strongest fit to scenario, risk posture, and impacted clients.
Return the chosen playbook name, a risk level, and concise explanations.
Leave client_message empty and actions empty if playbook selection alone is sufficient.

Required response shape:
{response_shape_text()}

Context:
{format_context(context)}
"""
    return STRICT_JSON_SYSTEM_PROMPT, user_prompt
