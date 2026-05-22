from __future__ import annotations

from app.repositories.base import BaseRepository


class ClientRepository(BaseRepository):
    collection_name = "clients"
