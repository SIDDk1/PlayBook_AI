from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import actions, clients, playbooks, portfolios, scenarios
from app.config.settings import get_settings
from app.db.mongo import mongo_database
from app.repositories.client_repository import ClientRepository
from app.repositories.playbook_repository import PlaybookRepository
from app.repositories.portfolio_repository import PortfolioRepository
from app.services.bootstrap_service import BootstrapService

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    await mongo_database.connect(settings)
    if settings.seed_demo_data:
        bootstrap_service = BootstrapService(
            PlaybookRepository(mongo_database.database),
            ClientRepository(mongo_database.database),
            PortfolioRepository(mongo_database.database),
        )
        await bootstrap_service.seed_demo_data()
    yield
    await mongo_database.disconnect()


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)

allowed_origins = [
    settings.frontend_origin,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(playbooks.router, prefix=settings.api_v1_prefix)
app.include_router(scenarios.router, prefix=settings.api_v1_prefix)
app.include_router(actions.router, prefix=settings.api_v1_prefix)
app.include_router(clients.router, prefix=settings.api_v1_prefix)
app.include_router(portfolios.router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name}
