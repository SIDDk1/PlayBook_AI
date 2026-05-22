from __future__ import annotations

from app.repositories.base import BaseRepository


class ScenarioRepository(BaseRepository):
    collection_name = "scenarios"
