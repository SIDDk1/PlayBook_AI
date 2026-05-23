# Sentinel AI - Project Architecture

Here is the detailed final structure of the fully cleaned and production-ready **Sentinel AI Playbook Generator** repository. 

Everything unnecessary has been stripped away, leaving a pristine, modular monorepo architecture.

## 🏗️ Root Workspace Files (DevOps & Config)
```text
PlayBook_AI/
├── 📄 setup.py             # Cross-platform CLI tool (Installs everything & runs the app)
├── 📄 demo.py              # Interactive CLI for testing agents and pipelines in the terminal
├── 📄 Makefile             # Quick command shortcuts (e.g., `make run`, `make clean`)
├── 📄 docker-compose.yml   # Containerization config for easy deployment
├── 📄 package.json         # Root monorepo workspace configuration
├── 📄 turbo.json           # Turborepo build optimization config
├── 📄 nx.json              # Monorepo task runner config
├── 📄 pnpm-workspace.yaml  # Package manager workspace definition
├── 📄 .gitignore           # Thorough git ignore rules (node_modules, venvs, DBs)
├── 📄 .dockerignore        # Lean Docker build context rules
├── 📄 .gitattributes       # Normalizes line endings across Windows/Mac/Linux
└── 📄 LICENSE              # Open-source MIT License
```

## 📚 Documentation (For Judges & Handoff)
```text
PlayBook_AI/
├── 📘 README.md            # Main project landing page (Features, Architecture, Setup)
├── 📘 PITCH_DECK.md        # 7-slide structure for your hackathon presentation
└── 📘 TUTORIAL.md          # Step-by-step guide to integrate real OpenAI keys and PostgreSQL
```

## ⚙️ apps/api/ (Backend - Python FastAPI)
This contains the core logic, AI orchestration, and database layer.
```text
PlayBook_AI/apps/api/
├── 📄 requirements.txt     # Python dependencies (FastAPI, SQLAlchemy, LangChain, etc.)
├── 📄 .env.example         # Template for environment variables (OPENAI_API_KEY, DATABASE_URL)
└── src/
    ├── 📄 main.py          # FastAPI application entry point
    ├── 📄 seed_db.py       # Auto-populates the DB with users, 3 clients, and 9 playbooks
    ├── 📄 test_pipeline.py # 100% E2E Integration test suite (Verifies everything works)
    │
    ├── api/v1/             # REST API Endpoints
    │   ├── 📄 auth.py      # Login and JWT token generation
    │   ├── 📄 playbooks.py # Playbook library & AI generation endpoints
    │   ├── 📄 scenarios.py # Triggering market scenarios endpoints
    │   └── 📄 workflows.py # Multi-stage approval endpoints
    │
    ├── models/             # SQLAlchemy Database Tables
    │   ├── 📄 user.py      # RBAC roles (RM, Risk, Compliance)
    │   ├── 📄 playbook.py  # Stores the 9 required playbook properties
    │   ├── 📄 scenario.py  # Active triggered scenarios
    │   ├── 📄 portfolio.py # Client and portfolio holdings
    │   └── 📄 approval.py  # Workflow approval tracking
    │
    ├── schemas/            # Pydantic Validation Models
    │   └── 📄 (Mirrors the models for API request/response validation)
    │
    ├── services/ai/        # 🧠 THE CORE AI ENGINE
    │   ├── 📄 agent_orchestrator.py  # The 7-step Multi-Agent cooperative pipeline
    │   ├── 📄 explainability_engine.py # Translates AI decisions into human-readable text
    │   ├── 📄 llm_service.py         # OpenAI integration + Intelligent mock fallback
    │   └── 📄 rag_pipeline.py        # Matches scenarios to playbooks using RAG
    │
    └── config/
        └── 📄 database.py  # Connects to Postgres OR falls back to local SQLite automatically
```

## 🎨 apps/web/ (Frontend - Next.js 14)
This contains the premium, glassmorphic React user interface.
```text
PlayBook_AI/apps/web/
├── 📄 package.json         # Frontend Node.js dependencies
├── 📄 next.config.js       # Next.js compiler settings
├── 📄 tailwind.config.ts   # Styling system rules and custom colors
├── 📄 postcss.config.js    # CSS processor config
└── src/
    ├── app/                # App Router Pages
    │   ├── 📄 page.tsx         # Main Dashboard
    │   ├── 📄 layout.tsx       # Global layout & navigation sidebar
    │   ├── 📄 globals.css      # Core styles, dark mode colors, glassmorphism utilities
    │   ├── login/              # Authentication screen
    │   ├── playbooks/          # AI Playbook Studio (Creation & Library)
    │   ├── scenarios/          # Market Scenario triggering & timeline view
    │   ├── approvals/          # Risk/Compliance approval dashboard
    │   ├── ai-copilot/         # Chat interface
    │   └── clients/            # Portfolio viewer
    │
    ├── components/         # Reusable React UI Blocks
    │   ├── 📄 ui/              # Buttons, inputs, modals, cards
    │   ├── 📄 layout/          # Sidebar, Navbar
    │   └── 📄 dashboard/       # Charts and metric widgets
    │
    ├── lib/                # Frontend Utilities
    │   └── 📄 api.ts           # Axios client configured to talk to the FastAPI backend
    │
    └── types/              # TypeScript Definitions
        └── 📄 index.ts         # Enums and interfaces mapping to backend schemas
```

### Structure Features 
1. **Zero Empty Folders**: Every folder and file serves a distinct, functional purpose. There is no confusing boilerplate.
2. **Clear Separation of Concerns**: AI logic (`services/ai/`), Database logic (`models/`), API routing (`api/v1/`), and UI (`apps/web/`) are strictly separated. 
3. **Portability**: It is completely portable. A judge can clone this, run `python setup.py`, and have a fully seeded database, backend, and frontend running in under 2 minutes without needing a Postgres instance or an OpenAI API key.
