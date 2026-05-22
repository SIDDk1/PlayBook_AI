from __future__ import annotations

from app.ai.providers.base import BaseAIProvider
from app.ai.providers.groq_provider import GroqProvider
from app.ai.providers.ollama_provider import OllamaProvider
from app.config.settings import Settings


def get_ai_provider(settings: Settings) -> BaseAIProvider:
    if settings.ai_provider.lower() == "groq":
        return GroqProvider(settings)
    return OllamaProvider(settings)
