from __future__ import annotations

from app.models.common import RiskLevel, ScenarioType
from app.schemas.engine import ScenarioDetectionInput, ScenarioDetectionResult


class ScenarioDetectionEngine:
    severity_map = {
        ScenarioType.MARKET_CRASH: RiskLevel.CRITICAL,
        ScenarioType.SECTOR_CORRECTION: RiskLevel.HIGH,
        ScenarioType.INTEREST_RATE_CHANGE: RiskLevel.MODERATE,
        ScenarioType.LIQUIDITY_STRESS: RiskLevel.CRITICAL,
        ScenarioType.EARNINGS_VOLATILITY: RiskLevel.MODERATE,
        ScenarioType.GEOPOLITICAL_EVENT: RiskLevel.HIGH,
        ScenarioType.CREDIT_DOWNGRADE: RiskLevel.HIGH,
        ScenarioType.CLIENT_PANIC_SELLING: RiskLevel.HIGH,
        ScenarioType.PORTFOLIO_CONCENTRATION_BREACH: RiskLevel.HIGH,
    }

    def detect(self, payload: ScenarioDetectionInput) -> ScenarioDetectionResult:
        severity = payload.severity_hint or self.severity_map[payload.scenario_type]
        impacted_client_ids = [client.id for client in payload.client_records]
        impacted_portfolio_ids = [portfolio.id for portfolio in payload.portfolio_records]
        signals = payload.market_signals or [payload.description]

        narrative = (
            f"{payload.scenario_type.replace('_', ' ').title()} detected for "
            f"{len(impacted_client_ids) or 'targeted'} client cohort(s) with {len(signals)} signal(s)."
        )

        return ScenarioDetectionResult(
            scenario=payload.scenario_type,
            title=payload.title,
            confidence=0.92 if payload.market_signals else 0.81,
            severity=severity,
            narrative=narrative,
            impacted_client_ids=impacted_client_ids,
            impacted_portfolio_ids=impacted_portfolio_ids,
            signals=signals,
        )
