from __future__ import annotations

from fastapi import HTTPException, status

from app.repositories.playbook_repository import PlaybookRepository
from app.schemas.playbook import PlaybookCreate, PlaybookResponse, PlaybookUpdate


class PlaybookService:
    def __init__(self, repository: PlaybookRepository) -> None:
        self.repository = repository

    async def list_playbooks(self) -> list[PlaybookResponse]:
        return [PlaybookResponse.model_validate(item) for item in await self.repository.list()]

    async def get_playbook(self, playbook_id: str) -> PlaybookResponse:
        document = await self.repository.get(playbook_id)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playbook not found.")
        return PlaybookResponse.model_validate(document)

    async def create_playbook(self, payload: PlaybookCreate) -> PlaybookResponse:
        created = await self.repository.create(payload.model_dump(mode="json"))
        return PlaybookResponse.model_validate(created)

    async def update_playbook(self, playbook_id: str, payload: PlaybookUpdate) -> PlaybookResponse:
        updated = await self.repository.update(playbook_id, payload.model_dump(mode="json"))
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playbook not found.")
        return PlaybookResponse.model_validate(updated)

    async def delete_playbook(self, playbook_id: str) -> None:
        deleted = await self.repository.delete(playbook_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playbook not found.")
