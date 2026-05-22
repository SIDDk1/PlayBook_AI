from __future__ import annotations

from app.repositories.client_repository import ClientRepository
from app.repositories.playbook_repository import PlaybookRepository
from app.repositories.portfolio_repository import PortfolioRepository
from app.utils.demo_data import DEFAULT_CLIENTS, DEFAULT_PLAYBOOKS, portfolio_seed


class BootstrapService:
    def __init__(
        self,
        playbook_repository: PlaybookRepository,
        client_repository: ClientRepository,
        portfolio_repository: PortfolioRepository,
    ) -> None:
        self.playbook_repository = playbook_repository
        self.client_repository = client_repository
        self.portfolio_repository = portfolio_repository

    async def seed_demo_data(self) -> None:
        if await self.playbook_repository.collection.count_documents({}) == 0:
            for playbook in DEFAULT_PLAYBOOKS:
                await self.playbook_repository.create(playbook)

        if await self.client_repository.collection.count_documents({}) == 0:
            created_clients = []
            for client in DEFAULT_CLIENTS:
                created_clients.append(await self.client_repository.create(client))

            if await self.portfolio_repository.collection.count_documents({}) == 0:
                for portfolio in portfolio_seed([client["id"] for client in created_clients]):
                    await self.portfolio_repository.create(portfolio)
