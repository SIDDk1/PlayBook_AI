# AI-Assisted Playbook Generator

Production-grade MVP for financial advisors to detect market scenarios, match structured response playbooks, generate explainable AI actions, and manage approvals.

## Project structure

```text
backend/
  app/
    api/routes/
    ai/
    config/
    db/
    engines/
    models/
    repositories/
    schemas/
    services/
    utils/
frontend/
  src/
    components/
    features/
    hooks/
    pages/
    services/
    store/
    types/
docs/
```

## Backend

- FastAPI with clean architecture boundaries
- MongoDB Atlas ready via Motor
- reusable engines for:
  - scenario detection
  - playbook matching
  - action generation
  - risk checks
  - escalation
- CRUD endpoints for:
  - `/playbooks`
  - `/scenarios`
  - `/actions`
  - `/clients`
  - `/portfolios`

Run locally:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

## AI layer

- single provider abstraction in `backend/app/ai/providers/`
- switch via `AI_PROVIDER=ollama|groq`
- local development uses Ollama (defaults to `deepseek-r1:1.5b` for out-of-the-box compatibility, configurable via `.env`)
- production uses Groq API
- agents:
  - `playbook_agent.py`
  - `action_agent.py`
  - `communication_agent.py`
  - `explanation_agent.py`

All AI responses normalize to:

```json
{
  "scenario": "",
  "playbook": "",
  "risk_level": "",
  "actions": [
    {
      "title": "",
      "description": "",
      "priority": "",
      "reason": ""
    }
  ],
  "explanations": [],
  "client_message": ""
}
```

## Frontend

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand for state management
- pages:
  - Dashboard
  - Playbooks
  - Scenario Monitor
  - Actions Panel
  - Clients

Run locally:

```bash
cd frontend
npm install
npm run dev
```

## Docker & Devcontainers

The entire stack (FastAPI, React Vite, MongoDB) is fully containerized for instant deployment and isolated development.

### Quick Start with Docker Compose

1. **Start all services**:
   ```bash
   docker-compose up --build
   ```
2. **Access Interfaces**:
   - **Frontend App**: [http://localhost:5173](http://localhost:5173) (includes hot-reloading for UI development)
   - **Backend API**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1) (includes interactive swagger docs at `/docs`)
   - **MongoDB Database**: `localhost:27017`

### Networking with Host Ollama (Critical Setup)

By default, the backend container connects to your host's Ollama instance via `http://host.docker.internal:11434`.
Because Ollama on Windows binds to `127.0.0.1` by default, **you must configure Ollama to accept external connections** so the Docker container can talk to it:
1. Close the Ollama application (quit from the Windows system tray).
2. Open Windows environment variables (Search for "Edit environment variables for your account") and add a new environment variable:
   - **Name**: `OLLAMA_HOST`
   - **Value**: `0.0.0.0`
3. Launch Ollama again. It will now accept connections from the container network and automatically pull/run the models!

### Visual Studio Code Devcontainers

1. Open the project folder in VS Code.
2. Install the **Dev Containers** extension (`ms-vscode-remote.remote-containers`).
3. Press `F1`, type `Dev Containers: Reopen in Container`, and press Enter.
4. VS Code will spin up the devcontainer shell, map folders, forward core ports, and pre-install all required Python, React, Tailwind, and MongoDB extensions.

## Environment variables

Copy `.env.example` and set:

- `MONGODB_URI`
- `AI_PROVIDER`
- `GROQ_API_KEY`
- `OLLAMA_BASE_URL`
- `VITE_API_BASE_URL`

Optional:

- `OLLAMA_MODEL`
- `GROQ_MODEL`

## Deployment

- backend: Render using `render.yaml`
- frontend: Vercel using `frontend/vercel.json`

## Notes

- demo playbooks, clients, and portfolios seed automatically on startup
- the frontend build is verified locally
- backend import and module compilation are verified locally
- live scenario execution still requires a running MongoDB instance and an available AI provider
