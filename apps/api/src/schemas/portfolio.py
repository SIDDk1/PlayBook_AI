from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

class PortfolioBase(BaseModel):
    name: str
    assets: List[Dict[str, Any]] = []
    total_value: float = 0.0
    risk_score: float = 0.0

class PortfolioCreate(PortfolioBase):
    client_id: int

class PortfolioResponse(PortfolioBase):
    id: int
    client_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ClientBase(BaseModel):
    name: str
    email: EmailStr
    risk_profile: str = "Moderate"
    segment: str = "Retail"

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    updated_at: datetime
    portfolios: List[PortfolioResponse] = []

    class Config:
        from_attributes = True
