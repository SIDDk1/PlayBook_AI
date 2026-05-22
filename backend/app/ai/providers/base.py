from __future__ import annotations

import json
from abc import ABC, abstractmethod
from typing import Any


class AIProviderError(RuntimeError):
    pass


class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        raise NotImplementedError

    def _load_json(self, content: str) -> dict[str, Any]:
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            start = content.find("{")
            end = content.rfind("}")
            if start == -1 or end == -1:
                raise AIProviderError("Provider did not return a JSON object.") from None
            try:
                return json.loads(content[start : end + 1])
            except json.JSONDecodeError as exc:
                raise AIProviderError("Provider returned malformed JSON.") from exc
