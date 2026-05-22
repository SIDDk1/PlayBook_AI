from __future__ import annotations

from app.models.common import RiskLevel, ScenarioType
from app.schemas.engine import RiskCheckFinding, RiskCheckResult, ScenarioDetectionResult
from app.schemas.portfolio import PortfolioResponse
from app.schemas.playbook import PlaybookResponse


class RiskCheckEngine:
    def evaluate(
        self,
        detection: ScenarioDetectionResult,
        portfolios: list[PortfolioResponse],
        playbook: PlaybookResponse | None,
    ) -> RiskCheckResult:
        findings: list[RiskCheckFinding] = []
        guardrail_hits: list[str] = []
        risk_level = detection.severity

        for portfolio in portfolios:
            max_holding = max((holding.weight_pct for holding in portfolio.holdings), default=0)
            if max_holding >= 25:
                findings.append(
                    RiskCheckFinding(
                        name="concentration_breach",
                        status="warning",
                        detail=f"{portfolio.name} has a top holding at {max_holding:.1f}%.",
                    )
                )
                guardrail_hits.append("Portfolio concentration exceeds 25%.")
                risk_level = RiskLevel.CRITICAL if max_holding >= 35 else RiskLevel.HIGH

            if portfolio.cash_ratio < 5 or portfolio.liquidity_score < 45:
                findings.append(
                    RiskCheckFinding(
                        name="liquidity_buffer",
                        status="warning",
                        detail=f"{portfolio.name} has limited liquidity cover.",
                    )
                )
                guardrail_hits.append("Low liquidity buffer detected.")
                if risk_level == RiskLevel.MODERATE:
                    risk_level = RiskLevel.HIGH

        if detection.scenario == ScenarioType.CLIENT_PANIC_SELLING:
            findings.append(
                RiskCheckFinding(
                    name="behavioral_risk",
                    status="critical",
                    detail="Client behavior indicates panic-selling pressure.",
                )
            )
            guardrail_hits.append("Client behavior requires advisor intervention before trade execution.")
            risk_level = RiskLevel.CRITICAL

        if playbook and playbook.guardrails:
            findings.append(
                RiskCheckFinding(
                    name="playbook_guardrails",
                    status="ok",
                    detail=f"{len(playbook.guardrails)} guardrail(s) attached to the matched playbook.",
                )
            )

        requires_approval = risk_level in {RiskLevel.HIGH, RiskLevel.CRITICAL}

        return RiskCheckResult(
            risk_level=risk_level,
            requires_approval=requires_approval,
            findings=findings,
            guardrail_hits=guardrail_hits,
        )
