from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase

from app.utils.mongo import normalize_document, prepare_write_payload, to_object_id


class BaseRepository:
    collection_name: str

    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection: AsyncIOMotorCollection = database[self.collection_name]

    async def list(self, filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        cursor = self.collection.find(filters or {}).sort("updated_at", -1)
        return [normalize_document(document) for document in await cursor.to_list(length=None)]

    async def get(self, resource_id: str) -> dict[str, Any] | None:
        document = await self.collection.find_one({"_id": to_object_id(resource_id)})
        return normalize_document(document)

    async def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        document = prepare_write_payload(payload)
        now = datetime.now(timezone.utc)
        document.setdefault("created_at", now)
        document["updated_at"] = now
        result = await self.collection.insert_one(document)
        created = await self.collection.find_one({"_id": result.inserted_id})
        return normalize_document(created)

    async def update(self, resource_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        document = prepare_write_payload(payload)
        document["updated_at"] = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": to_object_id(resource_id)},
            {"$set": document},
        )
        return await self.get(resource_id)

    async def delete(self, resource_id: str) -> bool:
        result = await self.collection.delete_one({"_id": to_object_id(resource_id)})
        return result.deleted_count > 0

    async def find_many_by_ids(self, resource_ids: list[str]) -> list[dict[str, Any]]:
        if not resource_ids:
            return []
        object_ids = [to_object_id(resource_id) for resource_id in resource_ids]
        cursor = self.collection.find({"_id": {"$in": object_ids}})
        return [normalize_document(document) for document in await cursor.to_list(length=None)]
