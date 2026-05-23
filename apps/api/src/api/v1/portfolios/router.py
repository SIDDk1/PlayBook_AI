from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.database import get_db
from auth.deps import get_current_user, RoleChecker
from models.portfolio import Portfolio, Client
from schemas.portfolio import PortfolioCreate, PortfolioResponse

router = APIRouter()

read_roles = RoleChecker(["RelationshipManager", "RiskOfficer", "ComplianceHead"])
write_roles = RoleChecker(["RelationshipManager"])

@router.post("/", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    portfolio_in: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user = Depends(write_roles)
):
    # Verify client exists
    client = db.query(Client).filter(Client.id == portfolio_in.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found."
        )
    portfolio = Portfolio(**portfolio_in.dict())
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio

@router.get("/", response_model=List[PortfolioResponse])
def list_portfolios(
    db: Session = Depends(get_db),
    current_user = Depends(read_roles)
):
    return db.query(Portfolio).all()

@router.get("/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(read_roles)
):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found."
        )
    return portfolio
