from __future__ import annotations

from fastapi import HTTPException, status

from app.repositories.client_repository import ClientRepository
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate


class ClientService:
    def __init__(self, repository: ClientRepository) -> None:
        self.repository = repository

    async def list_clients(self) -> list[ClientResponse]:
        return [ClientResponse.model_validate(item) for item in await self.repository.list()]

    async def get_client(self, client_id: str) -> ClientResponse:
        document = await self.repository.get(client_id)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found.")
        return ClientResponse.model_validate(document)

    async def create_client(self, payload: ClientCreate) -> ClientResponse:
        created = await self.repository.create(payload.model_dump(mode="json"))
        return ClientResponse.model_validate(created)

    async def update_client(self, client_id: str, payload: ClientUpdate) -> ClientResponse:
        updated = await self.repository.update(client_id, payload.model_dump(mode="json"))
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found.")
        return ClientResponse.model_validate(updated)

    async def delete_client(self, client_id: str) -> None:
        deleted = await self.repository.delete(client_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found.")
