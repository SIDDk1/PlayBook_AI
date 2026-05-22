from __future__ import annotations

from app.ai.prompt_templates.shared import STRICT_JSON_SYSTEM_PROMPT, format_context, response_shape_text


def build_action_prompt(context: dict) -> tuple[str, str]:
    user_prompt = f"""Generate next-best-actions for the matched playbook.
Recommend 3 to 4 actions that are specific, explainable, and suitable for a financial advisor workflow.
Use concise titles and practical descriptions.
Set client_message to an empty string if you are focusing only on actions.

Required response shape:
{response_shape_text()}

Context:
{format_context(context)}
"""
    return STRICT_JSON_SYSTEM_PROMPT, user_prompt
