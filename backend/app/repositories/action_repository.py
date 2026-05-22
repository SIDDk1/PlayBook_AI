from __future__ import annotations

from app.repositories.base import BaseRepository


class ActionRepository(BaseRepository):
    collection_name = "actions"
