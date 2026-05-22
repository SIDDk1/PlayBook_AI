from __future__ import annotations

from app.models.action import ActionRecommendation
from app.models.common import ActionPriority, RiskLevel
from app.schemas.ai import AIPlaybookResponse
from app.schemas.engine import EscalationResult, RiskCheckResult, ScenarioDetectionResult
from app.schemas.playbook import PlaybookResponse


class ActionGenerationEngine:
    priority_escalation = {
        ActionPriority.LOW: ActionPriority.MEDIUM,
        ActionPriority.MEDIUM: ActionPriority.HIGH,
        ActionPriority.HIGH: ActionPriority.URGENT,
        ActionPriority.URGENT: ActionPriority.URGENT,
    }

    def compose(
        self,
        ai_response: AIPlaybookResponse,
        detection: ScenarioDetectionResult,
        risk_summary: RiskCheckResult,
        escalation: EscalationResult,
    ) -> AIPlaybookResponse:
        normalized_actions: list[ActionRecommendation] = []
        for action in ai_response.actions:
            priority = action.priority
            if risk_summary.risk_level == RiskLevel.CRITICAL:
                priority = self.priority_escalation[action.priority]

            normalized_actions.append(
                ActionRecommendation(
                    title=action.title,
                    description=action.description,
                    priority=priority,
                    reason=action.reason,
                )
            )

        explanations = list(ai_response.explanations)
        if escalation.requires_escalation:
            explanations.append("Escalation workflow is required before execution.")
        if not explanations:
            explanations.append(detection.narrative)

        return AIPlaybookResponse(
            scenario=ai_response.scenario or detection.scenario.value,
            playbook=ai_response.playbook,
            risk_level=risk_summary.risk_level,
            actions=normalized_actions,
            explanations=explanations,
            client_message=ai_response.client_message,
        )

    def build_fallback(
        self,
        detection: ScenarioDetectionResult,
        playbook: PlaybookResponse | None,
        risk_summary: RiskCheckResult,
    ) -> AIPlaybookResponse:
        recommended_actions = playbook.recommended_actions if playbook else ["Review holdings and confirm advisor response path."]
        actions = [
            ActionRecommendation(
                title=f"Action {index + 1}",
                description=action_text,
                priority=ActionPriority.HIGH if risk_summary.risk_level != RiskLevel.LOW else ActionPriority.MEDIUM,
                reason="Generated from deterministic playbook fallback while AI response is unavailable.",
            )
            for index, action_text in enumerate(recommended_actions[:3])
        ]

        return AIPlaybookResponse(
            scenario=detection.scenario.value,
            playbook=playbook.name if playbook else "manual_response_playbook",
            risk_level=risk_summary.risk_level,
            actions=actions,
            explanations=[
                "Fallback plan created because the AI provider did not return a valid JSON response."
            ],
            client_message="We are actively reviewing current market conditions and will contact you with a tailored recommendation shortly.",
        )
