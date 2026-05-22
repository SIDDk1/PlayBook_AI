from __future__ import annotations

from app.repositories.base import BaseRepository


class ApprovalRepository(BaseRepository):
    collection_name = "approvals"
