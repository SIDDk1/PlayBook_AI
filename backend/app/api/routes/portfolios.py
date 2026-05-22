from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_portfolio_service
from app.schemas.common import MessageResponse
from app.schemas.portfolio import PortfolioCreate, PortfolioResponse, PortfolioUpdate
from app.services.portfolio_service import PortfolioService

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.get("", response_model=list[PortfolioResponse])
async def list_portfolios(service: PortfolioService = Depends(get_portfolio_service)) -> list[PortfolioResponse]:
    return await service.list_portfolios()


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: str,
    service: PortfolioService = Depends(get_portfolio_service),
) -> PortfolioResponse:
    return await service.get_portfolio(portfolio_id)


@router.post("", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio(
    payload: PortfolioCreate,
    service: PortfolioService = Depends(get_portfolio_service),
) -> PortfolioResponse:
    return await service.create_portfolio(payload)


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: str,
    payload: PortfolioUpdate,
    service: PortfolioService = Depends(get_portfolio_service),
) -> PortfolioResponse:
    return await service.update_portfolio(portfolio_id, payload)


@router.delete("/{portfolio_id}", response_model=MessageResponse)
async def delete_portfolio(
    portfolio_id: str,
    service: PortfolioService = Depends(get_portfolio_service),
) -> MessageResponse:
    await service.delete_portfolio(portfolio_id)
    return MessageResponse(message="Portfolio deleted successfully.")
