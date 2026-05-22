from __future__ import annotations

from app.models.common import ApprovalStatus, RiskLevel
from app.schemas.engine import EscalationResult, EscalationStep, RiskCheckResult
from app.schemas.playbook import PlaybookResponse


class EscalationEngine:
    def evaluate(
        self,
        risk_summary: RiskCheckResult,
        playbook: PlaybookResponse | None,
    ) -> EscalationResult:
        reasons = list(risk_summary.guardrail_hits)
        reviewers: list[EscalationStep] = []

        if playbook:
            for step in playbook.approval_workflow:
                reviewers.append(
                    EscalationStep(
                        role=step.role,
                        order=step.order,
                        reason="Playbook approval workflow requires sign-off.",
                        required=step.required,
                    )
                )

        if risk_summary.risk_level == RiskLevel.CRITICAL and not reviewers:
            reviewers.append(
                EscalationStep(
                    role="Chief Risk Officer",
                    order=1,
                    reason="Critical risk events require executive review.",
                )
            )

        requires_escalation = risk_summary.requires_approval or bool(reviewers)
        approval_status = ApprovalStatus.PENDING if requires_escalation else ApprovalStatus.APPROVED

        return EscalationResult(
            requires_escalation=requires_escalation,
            approval_status=approval_status,
            reasons=reasons or (["No escalation required."] if not requires_escalation else []),
            reviewers=reviewers,
        )
