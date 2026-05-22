from __future__ import annotations

from app.repositories.base import BaseRepository


class PortfolioRepository(BaseRepository):
    collection_name = "portfolios"
