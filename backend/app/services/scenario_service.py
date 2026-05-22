from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.ai.agents.action_agent import ActionAgent
from app.ai.agents.communication_agent import CommunicationAgent
from app.ai.agents.explanation_agent import ExplanationAgent
from app.ai.agents.playbook_agent import PlaybookAgent
from app.ai.providers.base import AIProviderError, BaseAIProvider
from app.engines.action_generation_engine import ActionGenerationEngine
from app.engines.escalation_engine import EscalationEngine
from app.engines.playbook_matching_engine import PlaybookMatchingEngine
from app.engines.risk_check_engine import RiskCheckEngine
from app.engines.scenario_detection_engine import ScenarioDetectionEngine
from app.models.common import ApprovalStatus
from app.repositories.action_repository import ActionRepository
from app.repositories.approval_repository import ApprovalRepository
from app.repositories.client_repository import ClientRepository
from app.repositories.playbook_repository import PlaybookRepository
from app.repositories.portfolio_repository import PortfolioRepository
from app.repositories.scenario_repository import ScenarioRepository
from app.schemas.action import ActionRecordResponse
from app.schemas.ai import AIPlaybookResponse
from app.schemas.client import ClientResponse
from app.schemas.engine import ScenarioDetectionInput
from app.schemas.playbook import PlaybookResponse
from app.schemas.portfolio import PortfolioResponse
from app.schemas.scenario import ScenarioCreate, ScenarioResponse, ScenarioUpdate


class ScenarioService:
    def __init__(
        self,
        scenario_repository: ScenarioRepository,
        playbook_repository: PlaybookRepository,
        client_repository: ClientRepository,
        portfolio_repository: PortfolioRepository,
        action_repository: ActionRepository,
        approval_repository: ApprovalRepository,
        ai_provider: BaseAIProvider,
    ) -> None:
        self.scenario_repository = scenario_repository
        self.playbook_repository = playbook_repository
        self.client_repository = client_repository
        self.portfolio_repository = portfolio_repository
        self.action_repository = action_repository
        self.approval_repository = approval_repository

        self.detection_engine = ScenarioDetectionEngine()
        self.playbook_matching_engine = PlaybookMatchingEngine()
        self.risk_check_engine = RiskCheckEngine()
        self.escalation_engine = EscalationEngine()
        self.action_generation_engine = ActionGenerationEngine()

        self.playbook_agent = PlaybookAgent(ai_provider)
        self.action_agent = ActionAgent(ai_provider)
        self.communication_agent = CommunicationAgent(ai_provider)
        self.explanation_agent = ExplanationAgent(ai_provider)

    async def list_scenarios(self) -> list[ScenarioResponse]:
        return [ScenarioResponse.model_validate(item) for item in await self.scenario_repository.list()]

    async def get_scenario(self, scenario_id: str) -> ScenarioResponse:
        document = await self.scenario_repository.get(scenario_id)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")
        return ScenarioResponse.model_validate(document)

    async def create_scenario(self, payload: ScenarioCreate) -> ScenarioResponse:
        scenario_record, action_record = await self._analyze_and_persist(payload.model_dump())
        scenario_record["action_record_id"] = action_record["id"]
        updated = await self.scenario_repository.update(scenario_record["id"], {"action_record_id": action_record["id"]})
        return ScenarioResponse.model_validate(updated)

    async def update_scenario(self, scenario_id: str, payload: ScenarioUpdate) -> ScenarioResponse:
        current = await self.scenario_repository.get(scenario_id)
        if not current:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

        scenario_record, action_record = await self._analyze_and_persist(
            payload.model_dump(),
            scenario_id=scenario_id,
            existing_action_id=current.get("action_record_id"),
        )
        scenario_record["action_record_id"] = action_record["id"]
        updated = await self.scenario_repository.update(scenario_id, scenario_record)
        return ScenarioResponse.model_validate(updated)

    async def delete_scenario(self, scenario_id: str) -> None:
        deleted = await self.scenario_repository.delete(scenario_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    async def _analyze_and_persist(
        self,
        payload: dict,
        scenario_id: str | None = None,
        existing_action_id: str | None = None,
    ) -> tuple[dict, dict]:
        client_records = [
            ClientResponse.model_validate(item)
            for item in await self.client_repository.find_many_by_ids(payload.get("client_ids", []))
        ]
        portfolio_records = [
            PortfolioResponse.model_validate(item)
            for item in await self.portfolio_repository.find_many_by_ids(payload.get("portfolio_ids", []))
        ]
        playbooks = [PlaybookResponse.model_validate(item) for item in await self.playbook_repository.list()]

        detection = self.detection_engine.detect(
            ScenarioDetectionInput(
                scenario_type=payload["scenario_type"],
                title=payload["title"],
                description=payload["description"],
                client_records=client_records,
                portfolio_records=portfolio_records,
                affected_sectors=payload.get("affected_sectors", []),
                market_signals=[signal["metric"] for signal in payload.get("market_signals", [])],
                severity_hint=payload.get("severity_hint"),
            )
        )

        playbook_match = self.playbook_matching_engine.match(detection, playbooks)
        matched_playbook = next(
            (playbook for playbook in playbooks if playbook.id == playbook_match.selected_playbook_id),
            None,
        )
        risk_summary = self.risk_check_engine.evaluate(detection, portfolio_records, matched_playbook)
        escalation = self.escalation_engine.evaluate(risk_summary, matched_playbook)
        ai_response = await self._generate_ai_response(
            payload=payload,
            detection=detection,
            playbook_match=playbook_match.model_dump(mode="json"),
            matched_playbook=matched_playbook,
            risk_summary=risk_summary.model_dump(mode="json"),
            escalation=escalation.model_dump(mode="json"),
            clients=client_records,
            portfolios=portfolio_records,
        )
        analysis = self.action_generation_engine.compose(ai_response, detection, risk_summary, escalation)

        scenario_document = {
            **payload,
            "detected_at": datetime.now(timezone.utc),
            "detection": detection.model_dump(mode="json"),
            "playbook_match": playbook_match.model_dump(mode="json"),
            "risk_summary": risk_summary.model_dump(mode="json"),
            "escalation": escalation.model_dump(mode="json"),
            "analysis": analysis.model_dump(mode="json"),
        }

        if scenario_id:
            await self.scenario_repository.update(scenario_id, scenario_document)
            scenario_record = await self.scenario_repository.get(scenario_id)
        else:
            scenario_record = await self.scenario_repository.create(scenario_document)

        action_document = {
            "scenario_id": scenario_record["id"],
            "playbook_id": matched_playbook.id if matched_playbook else None,
            "scenario": analysis.scenario,
            "playbook": analysis.playbook,
            "risk_level": analysis.risk_level,
            "client_ids": payload.get("client_ids", []),
            "portfolio_ids": payload.get("portfolio_ids", []),
            "actions": [item.model_dump(mode="json") for item in analysis.actions],
            "explanations": analysis.explanations,
            "client_message": analysis.client_message,
            "guardrails": risk_summary.guardrail_hits,
            "approval_status": escalation.approval_status,
            "approvals_needed": [reviewer.role for reviewer in escalation.reviewers],
        }

        if existing_action_id:
            await self.action_repository.update(existing_action_id, action_document)
            action_record = await self.action_repository.get(existing_action_id)
        else:
            action_record = await self.action_repository.create(action_document)

        if escalation.approval_status == ApprovalStatus.PENDING:
            await self._record_approvals(action_record["id"], scenario_record["id"], escalation.model_dump(mode="json"))

        return scenario_record, action_record

    async def _record_approvals(self, action_id: str, scenario_id: str, escalation: dict) -> None:
        for reviewer in escalation.get("reviewers", []):
            await self.approval_repository.create(
                {
                    "scenario_id": scenario_id,
                    "action_id": action_id,
                    "reviewer_role": reviewer["role"],
                    "review_order": reviewer["order"],
                    "status": "pending",
                    "reason": reviewer["reason"],
                }
            )

    async def _generate_ai_response(
        self,
        payload: dict,
        detection,
        playbook_match: dict,
        matched_playbook: PlaybookResponse | None,
        risk_summary: dict,
        escalation: dict,
        clients: list[ClientResponse],
        portfolios: list[PortfolioResponse],
    ) -> AIPlaybookResponse:
        fallback = self.action_generation_engine.build_fallback(detection, matched_playbook, self.risk_check_engine.evaluate(detection, portfolios, matched_playbook))
        defaults = {
            "scenario": detection.scenario.value,
            "playbook": matched_playbook.name if matched_playbook else playbook_match.get("selected_playbook_name", ""),
            "risk_level": risk_summary["risk_level"],
            "actions": fallback.actions,
            "explanations": fallback.explanations,
            "client_message": fallback.client_message,
        }

        context = {
            "scenario_request": payload,
            "detection": detection.model_dump(mode="json"),
            "playbook_match": playbook_match,
            "matched_playbook": matched_playbook.model_dump(mode="json") if matched_playbook else None,
            "risk_summary": risk_summary,
            "escalation": escalation,
            "clients": [client.model_dump(mode="json") for client in clients],
            "portfolios": [portfolio.model_dump(mode="json") for portfolio in portfolios],
        }

        try:
            playbook_response = await self.playbook_agent.recommend(context, defaults)
            action_response = await self.action_agent.generate(
                {**context, "current_plan": playbook_response.model_dump(mode="json")},
                {
                    **defaults,
                    "playbook": playbook_response.playbook or defaults["playbook"],
                    "explanations": playbook_response.explanations,
                },
            )
            communication_response = await self.communication_agent.generate(
                {**context, "current_plan": action_response.model_dump(mode="json")},
                action_response.model_dump(mode="json"),
            )
            explanation_response = await self.explanation_agent.generate(
                {**context, "current_plan": communication_response.model_dump(mode="json")},
                communication_response.model_dump(mode="json"),
            )
            return AIPlaybookResponse(
                scenario=action_response.scenario,
                playbook=action_response.playbook,
                risk_level=action_response.risk_level,
                actions=action_response.actions,
                explanations=explanation_response.explanations or action_response.explanations,
                client_message=communication_response.client_message,
            )
        except AIProviderError:
            return fallback
