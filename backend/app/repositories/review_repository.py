from __future__ import annotations

from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository):
    collection_name = "reviews"
