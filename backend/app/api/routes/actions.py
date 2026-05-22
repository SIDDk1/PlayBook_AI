from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_action_service
from app.schemas.action import ActionRecordCreate, ActionRecordResponse, ActionRecordUpdate
from app.schemas.common import MessageResponse
from app.services.action_service import ActionService

router = APIRouter(prefix="/actions", tags=["actions"])


@router.get("", response_model=list[ActionRecordResponse])
async def list_actions(service: ActionService = Depends(get_action_service)) -> list[ActionRecordResponse]:
    return await service.list_actions()


@router.get("/{action_id}", response_model=ActionRecordResponse)
async def get_action(action_id: str, service: ActionService = Depends(get_action_service)) -> ActionRecordResponse:
    return await service.get_action(action_id)


@router.post("", response_model=ActionRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_action(
    payload: ActionRecordCreate,
    service: ActionService = Depends(get_action_service),
) -> ActionRecordResponse:
    return await service.create_action(payload)


@router.put("/{action_id}", response_model=ActionRecordResponse)
async def update_action(
    action_id: str,
    payload: ActionRecordUpdate,
    service: ActionService = Depends(get_action_service),
) -> ActionRecordResponse:
    return await service.update_action(action_id, payload)


@router.delete("/{action_id}", response_model=MessageResponse)
async def delete_action(action_id: str, service: ActionService = Depends(get_action_service)) -> MessageResponse:
    await service.delete_action(action_id)
    return MessageResponse(message="Action record deleted successfully.")
