from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.database import get_db
from auth.deps import get_current_user, RoleChecker
from models.portfolio import Client
from schemas.portfolio import ClientCreate, ClientResponse

router = APIRouter()

# Allow RelationshipManagers, RiskOfficers, and ComplianceHeads to read clients
read_roles = RoleChecker(["RelationshipManager", "RiskOfficer", "ComplianceHead"])
# Only RelationshipManagers can create/manage clients
write_roles = RoleChecker(["RelationshipManager"])

@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_in: ClientCreate,
    db: Session = Depends(get_db),
    current_user = Depends(write_roles)
):
    existing = db.query(Client).filter(Client.email == client_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client with this email already exists."
        )
    client = Client(**client_in.dict())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.get("/", response_model=List[ClientResponse])
def list_clients(
    db: Session = Depends(get_db),
    current_user = Depends(read_roles)
):
    return db.query(Client).all()

@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(read_roles)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found."
        )
    return client
