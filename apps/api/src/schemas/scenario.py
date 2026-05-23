from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class ScenarioBase(BaseModel):
    type: str
    severity: str = "Warning"  # Info, Warning, Critical
    market_data: Dict[str, Any] = {}
    status: str = "Active"     # Active, Resolved

class ScenarioCreate(ScenarioBase):
    pass

class ScenarioUpdate(BaseModel):
    type: Optional[str] = None
    severity: Optional[str] = None
    market_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class ScenarioResponse(ScenarioBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
