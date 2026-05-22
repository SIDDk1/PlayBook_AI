from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_client_service
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate
from app.schemas.common import MessageResponse
from app.services.client_service import ClientService

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("", response_model=list[ClientResponse])
async def list_clients(service: ClientService = Depends(get_client_service)) -> list[ClientResponse]:
    return await service.list_clients()


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str, service: ClientService = Depends(get_client_service)) -> ClientResponse:
    return await service.get_client(client_id)


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(payload: ClientCreate, service: ClientService = Depends(get_client_service)) -> ClientResponse:
    return await service.create_client(payload)


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    payload: ClientUpdate,
    service: ClientService = Depends(get_client_service),
) -> ClientResponse:
    return await service.update_client(client_id, payload)


@router.delete("/{client_id}", response_model=MessageResponse)
async def delete_client(client_id: str, service: ClientService = Depends(get_client_service)) -> MessageResponse:
    await service.delete_client(client_id)
    return MessageResponse(message="Client deleted successfully.")
