from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config.settings import Settings


class MongoDatabase:
    def __init__(self) -> None:
        self._client: AsyncIOMotorClient | None = None
        self._database: AsyncIOMotorDatabase | None = None

    async def connect(self, settings: Settings) -> None:
        self._client = AsyncIOMotorClient(settings.mongodb_uri)
        self._database = self._client[settings.mongodb_database]

    async def disconnect(self) -> None:
        if self._client:
            self._client.close()
        self._client = None
        self._database = None

    @property
    def database(self) -> AsyncIOMotorDatabase:
        if self._database is None:
            raise RuntimeError("Database connection has not been initialized.")
        return self._database


mongo_database = MongoDatabase()
