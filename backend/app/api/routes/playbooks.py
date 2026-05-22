from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_playbook_service
from app.schemas.common import MessageResponse
from app.schemas.playbook import PlaybookCreate, PlaybookResponse, PlaybookUpdate
from app.services.playbook_service import PlaybookService

router = APIRouter(prefix="/playbooks", tags=["playbooks"])


@router.get("", response_model=list[PlaybookResponse])
async def list_playbooks(service: PlaybookService = Depends(get_playbook_service)) -> list[PlaybookResponse]:
    return await service.list_playbooks()


@router.get("/{playbook_id}", response_model=PlaybookResponse)
async def get_playbook(playbook_id: str, service: PlaybookService = Depends(get_playbook_service)) -> PlaybookResponse:
    return await service.get_playbook(playbook_id)


@router.post("", response_model=PlaybookResponse, status_code=status.HTTP_201_CREATED)
async def create_playbook(
    payload: PlaybookCreate,
    service: PlaybookService = Depends(get_playbook_service),
) -> PlaybookResponse:
    return await service.create_playbook(payload)


@router.put("/{playbook_id}", response_model=PlaybookResponse)
async def update_playbook(
    playbook_id: str,
    payload: PlaybookUpdate,
    service: PlaybookService = Depends(get_playbook_service),
) -> PlaybookResponse:
    return await service.update_playbook(playbook_id, payload)


@router.delete("/{playbook_id}", response_model=MessageResponse)
async def delete_playbook(
    playbook_id: str,
    service: PlaybookService = Depends(get_playbook_service),
) -> MessageResponse:
    await service.delete_playbook(playbook_id)
    return MessageResponse(message="Playbook deleted successfully.")
