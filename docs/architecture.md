# AI-Assisted Playbook Generator

## System flow

`Scenario -> Detection Engine -> Playbook Matching -> AI Action Generation -> Risk Check -> Approval -> Execution -> Review`

## Backend layers

- `api/routes/`: thin FastAPI endpoints only
- `services/`: orchestration and workflow coordination
- `engines/`: reusable domain logic for detection, matching, risk, escalation, and action shaping
- `repositories/`: MongoDB Atlas access using Motor
- `ai/`: provider abstraction, prompts, and agents

## AI provider strategy

- `AI_PROVIDER=ollama` uses `deepseek-r1:8b` through Ollama for local development
- `AI_PROVIDER=groq` uses the Groq OpenAI-compatible API for production
- all model calls route through `app/ai/factory.py` and `app/ai/providers/*`

## Core collections

- `playbooks`
- `scenarios`
- `clients`
- `portfolios`
- `actions`
- `approvals`
- `reviews`

## MVP path

1. Demo playbooks, clients, and portfolios seed automatically on startup.
2. A user manually triggers a scenario from the frontend.
3. The backend detects severity, matches a playbook, runs AI agents, and stores the outcome.
4. The dashboard and actions panel surface playbook selection, next-best-actions, and approval status.
