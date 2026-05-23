from fastapi import APIRouter
from api.v1.auth.router import router as auth_router
from api.v1.playbooks.router import router as playbook_router
from api.v1.scenarios.router import router as scenario_router
from api.v1.clients.router import router as client_router
from api.v1.portfolios.router import router as portfolio_router
from api.v1.approvals.router import router as approvals_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(playbook_router, prefix="/playbooks", tags=["playbooks"])
router.include_router(scenario_router, prefix="/scenarios", tags=["scenarios"])
router.include_router(client_router, prefix="/clients", tags=["clients"])
router.include_router(portfolio_router, prefix="/portfolios", tags=["portfolios"])
router.include_router(approvals_router, prefix="/approvals", tags=["approvals"])
