from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import engine, Base
from config.settings import settings

# CRITICAL: Import all models to register with SQLAlchemy mapper BEFORE create_all()
from models import (
    Permission, Role, User, role_permissions,
    Client, Portfolio, Scenario, Playbook,
    Workflow, Approval, Communication,
    AuditLog, Notification, Analytics,
)

from api.router import router as api_router
from middleware.audit import AuditMiddleware

# Auto-create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sentinel AI Playbook API",
    description="Institutional AI Wealth Management Scenario Responder — Six-Agent Pipeline",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend Next.js queries
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Auditing Middleware
app.add_middleware(AuditMiddleware)

# Mount all API routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["health"])
async def root():
    return {
        "status": "online",
        "service": "Sentinel AI Playbook API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "auth": f"{settings.API_V1_STR}/auth",
            "playbooks": f"{settings.API_V1_STR}/playbooks",
            "scenarios": f"{settings.API_V1_STR}/scenarios",
            "clients": f"{settings.API_V1_STR}/clients",
            "portfolios": f"{settings.API_V1_STR}/portfolios",
            "approvals": f"{settings.API_V1_STR}/approvals",
        },
    }


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "database": "connected"}
