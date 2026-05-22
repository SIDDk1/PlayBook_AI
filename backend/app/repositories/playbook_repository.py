from __future__ import annotations

from app.repositories.base import BaseRepository


class PlaybookRepository(BaseRepository):
    collection_name = "playbooks"
