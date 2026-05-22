from __future__ import annotations

from typing import Any

import httpx

from app.ai.providers.base import AIProviderError, BaseAIProvider
from app.config.settings import Settings


class OllamaProvider(BaseAIProvider):
    def __init__(self, settings: Settings) -> None:
        self._base_url = settings.ollama_base_url.rstrip("/")
        self._model = settings.ollama_model

    async def _pull_model(self) -> None:
        """Attempt to pull the configured model automatically from Ollama."""
        print(f"Ollama model '{self._model}' not found locally. Attempting to pull it automatically...")
        async with httpx.AsyncClient(timeout=600.0) as client:
            try:
                response = await client.post(
                    f"{self._base_url}/api/pull",
                    json={"name": self._model, "stream": False},
                )
                if response.status_code == 200:
                    print(f"Successfully pulled model '{self._model}'!")
                else:
                    raise AIProviderError(
                        f"Failed to pull model '{self._model}'. Status: {response.status_code}"
                    )
            except Exception as e:
                raise AIProviderError(
                    f"Error pulling model '{self._model}' from Ollama at {self._base_url}: {e}"
                )

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        payload = {
            "model": self._model,
            "stream": False,
            "format": schema or "json",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(f"{self._base_url}/api/chat", json=payload)
            except httpx.ConnectError as e:
                raise AIProviderError(
                    f"Connection to Ollama failed at '{self._base_url}'. "
                    f"Please verify Ollama is running. Error: {e}"
                )

            # If Ollama returns 404 (Not Found) or 500 with 'not found' in the error text, pull the model
            if response.status_code == 404 or (
                response.status_code == 500 and "not found" in response.text.lower()
            ):
                await self._pull_model()
                # Retry generating after the model has been pulled
                try:
                    response = await client.post(f"{self._base_url}/api/chat", json=payload)
                except httpx.ConnectError as e:
                    raise AIProviderError(f"Connection to Ollama failed on retry: {e}")

        if response.status_code >= 400:
            raise AIProviderError(
                f"Ollama request failed with status {response.status_code}. Response: {response.text}"
            )

        content = response.json().get("message", {}).get("content", "")
        return self._load_json(content)
