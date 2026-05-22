from __future__ import annotations

from typing import Any

import httpx

from app.ai.providers.base import AIProviderError, BaseAIProvider
from app.config.settings import Settings


class GroqProvider(BaseAIProvider):
    def __init__(self, settings: Settings) -> None:
        if not settings.groq_api_key:
            raise AIProviderError("GROQ_API_KEY is required when AI_PROVIDER=groq.")
        self._api_key = settings.groq_api_key
        self._model = settings.groq_model

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        payload = {
            "model": self._model,
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
            )

        if response.status_code >= 400:
            raise AIProviderError(f"Groq request failed with status {response.status_code}.")

        content = response.json()["choices"][0]["message"]["content"]
        return self._load_json(content)
