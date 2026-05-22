from __future__ import annotations

import json
from typing import Any


RESPONSE_SHAPE = {
    "scenario": "",
    "playbook": "",
    "risk_level": "",
    "actions": [
        {
            "title": "",
            "description": "",
            "priority": "",
            "reason": "",
        }
    ],
    "explanations": [],
    "client_message": "",
}


STRICT_JSON_SYSTEM_PROMPT = """You are an institutional AI assistant for financial advisors.
Return raw JSON only.
Never wrap the JSON in markdown.
Use the exact keys and array structure requested.
If a field is not the focus of the task, still return it with an empty string or empty array.
Risk levels must be one of: low, moderate, high, critical.
Action priorities must be one of: low, medium, high, urgent."""


def format_context(payload: dict[str, Any]) -> str:
    return json.dumps(payload, indent=2, default=str)


def response_shape_text() -> str:
    return json.dumps(RESPONSE_SHAPE, indent=2)
