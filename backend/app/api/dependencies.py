from __future__ import annotations

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.ai.factory import get_ai_provider
from app.config.settings import Settings, get_settings
from app.db.mongo import mongo_database
from app.repositories.action_repository import ActionRepository
from app.repositories.approval_repository import ApprovalRepository
from app.repositories.client_repository import ClientRepository
from app.repositories.playbook_repository import PlaybookRepository
from app.repositories.portfolio_repository import PortfolioRepository
from app.repositories.review_repository import ReviewRepository
from app.repositories.scenario_repository import ScenarioRepository
from app.services.action_service import ActionService
from app.services.client_service import ClientService
from app.services.playbook_service import PlaybookService
from app.services.portfolio_service import PortfolioService
from app.services.scenario_service import ScenarioService


def get_database() -> AsyncIOMotorDatabase:
    return mongo_database.database


def get_playbook_service(database: AsyncIOMotorDatabase = Depends(get_database)) -> PlaybookService:
    return PlaybookService(PlaybookRepository(database))


def get_client_service(database: AsyncIOMotorDatabase = Depends(get_database)) -> ClientService:
    return ClientService(ClientRepository(database))


def get_portfolio_service(database: AsyncIOMotorDatabase = Depends(get_database)) -> PortfolioService:
    return PortfolioService(PortfolioRepository(database))


def get_action_service(database: AsyncIOMotorDatabase = Depends(get_database)) -> ActionService:
    return ActionService(
        ActionRepository(database),
        ApprovalRepository(database),
        ReviewRepository(database),
    )


def get_scenario_service(
    database: AsyncIOMotorDatabase = Depends(get_database),
    settings: Settings = Depends(get_settings),
) -> ScenarioService:
    return ScenarioService(
        ScenarioRepository(database),
        PlaybookRepository(database),
        ClientRepository(database),
        PortfolioRepository(database),
        ActionRepository(database),
        ApprovalRepository(database),
        get_ai_provider(settings),
    )
