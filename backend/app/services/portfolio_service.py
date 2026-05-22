from __future__ import annotations

from fastapi import HTTPException, status

from app.repositories.portfolio_repository import PortfolioRepository
from app.schemas.portfolio import PortfolioCreate, PortfolioResponse, PortfolioUpdate


class PortfolioService:
    def __init__(self, repository: PortfolioRepository) -> None:
        self.repository = repository

    async def list_portfolios(self) -> list[PortfolioResponse]:
        return [PortfolioResponse.model_validate(item) for item in await self.repository.list()]

    async def get_portfolio(self, portfolio_id: str) -> PortfolioResponse:
        document = await self.repository.get(portfolio_id)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")
        return PortfolioResponse.model_validate(document)

    async def create_portfolio(self, payload: PortfolioCreate) -> PortfolioResponse:
        created = await self.repository.create(payload.model_dump(mode="json"))
        return PortfolioResponse.model_validate(created)

    async def update_portfolio(self, portfolio_id: str, payload: PortfolioUpdate) -> PortfolioResponse:
        updated = await self.repository.update(portfolio_id, payload.model_dump(mode="json"))
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")
        return PortfolioResponse.model_validate(updated)

    async def delete_portfolio(self, portfolio_id: str) -> None:
        deleted = await self.repository.delete(portfolio_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")
