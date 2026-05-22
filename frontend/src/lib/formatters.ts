import type { ApprovalStatus, RiskLevel, ScenarioType } from "@/types";

export const scenarioLabels: Record<ScenarioType, string> = {
  market_crash: "Market Crash",
  sector_correction: "Sector Correction",
  interest_rate_change: "Interest Rate Change",
  liquidity_stress: "Liquidity Stress",
  earnings_volatility: "Earnings Volatility",
  geopolitical_event: "Geopolitical Event",
  credit_downgrade: "Credit Downgrade",
  client_panic_selling_behavior: "Client Panic Selling",
  portfolio_concentration_breach: "Portfolio Concentration Breach",
};

export function formatScenarioLabel(value: ScenarioType | string) {
  return scenarioLabels[value as ScenarioType] ?? value.replaceAll("_", " ");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export function riskBadgeVariant(riskLevel: RiskLevel) {
  switch (riskLevel) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    case "moderate":
      return "secondary";
    default:
      return "outline";
  }
}

export function approvalTone(status: ApprovalStatus) {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "executed":
      return "Executed";
    case "pending_approval":
      return "Pending";
    default:
      return "Draft";
  }
}
