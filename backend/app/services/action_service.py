from __future__ import annotations

from fastapi import HTTPException, status

from app.models.common import ApprovalStatus
from app.repositories.action_repository import ActionRepository
from app.repositories.approval_repository import ApprovalRepository
from app.repositories.review_repository import ReviewRepository
from app.schemas.action import ActionRecordCreate, ActionRecordResponse, ActionRecordUpdate


class ActionService:
    def __init__(
        self,
        repository: ActionRepository,
        approval_repository: ApprovalRepository,
        review_repository: ReviewRepository,
    ) -> None:
        self.repository = repository
        self.approval_repository = approval_repository
        self.review_repository = review_repository

    async def list_actions(self) -> list[ActionRecordResponse]:
        return [ActionRecordResponse.model_validate(item) for item in await self.repository.list()]

    async def get_action(self, action_id: str) -> ActionRecordResponse:
        document = await self.repository.get(action_id)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action record not found.")
        return ActionRecordResponse.model_validate(document)

    async def create_action(self, payload: ActionRecordCreate) -> ActionRecordResponse:
        created = await self.repository.create(payload.model_dump(mode="json"))
        return ActionRecordResponse.model_validate(created)

    async def update_action(self, action_id: str, payload: ActionRecordUpdate) -> ActionRecordResponse:
        updated = await self.repository.update(action_id, payload.model_dump(mode="json"))
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action record not found.")

        if payload.approval_status in {ApprovalStatus.APPROVED, ApprovalStatus.REJECTED}:
            await self.approval_repository.create(
                {
                    "action_id": action_id,
                    "status": payload.approval_status.value,
                    "notes": payload.execution_notes or "",
                }
            )

        if payload.approval_status == ApprovalStatus.EXECUTED:
            await self.review_repository.create(
                {
                    "action_id": action_id,
                    "summary": payload.execution_notes or "Action executed and queued for review.",
                }
            )

        return ActionRecordResponse.model_validate(updated)

    async def delete_action(self, action_id: str) -> None:
        deleted = await self.repository.delete(action_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action record not found.")
