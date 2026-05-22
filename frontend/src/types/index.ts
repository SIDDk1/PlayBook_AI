export type ScenarioType =
  | "market_crash"
  | "sector_correction"
  | "interest_rate_change"
  | "liquidity_stress"
  | "earnings_volatility"
  | "geopolitical_event"
  | "credit_downgrade"
  | "client_panic_selling_behavior"
  | "portfolio_concentration_breach";

export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type ActionPriority = "low" | "medium" | "high" | "urgent";
export type ApprovalStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "executed";

export interface Resource {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CommunicationTemplate {
  channel: string;
  audience: string;
  subject: string;
  body: string;
}

export interface ApprovalWorkflowStep {
  role: string;
  order: number;
  required: boolean;
  sla_hours: number;
}

export interface ReviewMetric {
  name: string;
  target: string;
  description: string;
}

export interface ActionRecommendation {
  title: string;
  description: string;
  priority: ActionPriority;
  reason: string;
}

export interface Playbook extends Resource {
  name: string;
  scenario_type: ScenarioType;
  description: string;
  trigger_conditions: string[];
  impacted_clients: string[];
  risk_checks: string[];
  recommended_actions: string[];
  communication_templates: CommunicationTemplate[];
  guardrails: string[];
  escalation_rules: string[];
  approval_workflow: ApprovalWorkflowStep[];
  review_metrics: ReviewMetric[];
  tags: string[];
}

export interface ClientPreference {
  communication_channel: string;
  preferred_contact_time: string;
}

export interface Client extends Resource {
  name: string;
  segment: string;
  risk_tolerance: string;
  advisor_owner: string;
  behavior_flags: string[];
  preferences: ClientPreference;
  assets_under_advice: number;
}

export interface PortfolioAllocation {
  asset_name: string;
  sector: string;
  weight_pct: number;
  liquidity_tier: string;
  credit_rating?: string | null;
}

export interface Portfolio extends Resource {
  client_id: string;
  name: string;
  total_value: number;
  cash_ratio: number;
  liquidity_score: number;
  holdings: PortfolioAllocation[];
}

export interface MarketSignal {
  metric: string;
  value: string | number;
  direction?: string | null;
  note?: string | null;
}

export interface ScenarioDetectionResult {
  scenario: ScenarioType;
  title: string;
  confidence: number;
  severity: RiskLevel;
  narrative: string;
  impacted_client_ids: string[];
  impacted_portfolio_ids: string[];
  signals: string[];
}

export interface PlaybookMatchCandidate {
  playbook_id: string;
  playbook_name: string;
  score: number;
  reasons: string[];
}

export interface PlaybookMatchResult {
  selected_playbook_id?: string | null;
  selected_playbook_name?: string | null;
  confidence: number;
  candidates: PlaybookMatchCandidate[];
}

export interface RiskCheckFinding {
  name: string;
  status: string;
  detail: string;
}

export interface RiskCheckResult {
  risk_level: RiskLevel;
  requires_approval: boolean;
  findings: RiskCheckFinding[];
  guardrail_hits: string[];
}

export interface EscalationStep {
  role: string;
  order: number;
  reason: string;
  required: boolean;
}

export interface EscalationResult {
  requires_escalation: boolean;
  approval_status: ApprovalStatus;
  reasons: string[];
  reviewers: EscalationStep[];
}

export interface AIPlaybookResponse {
  scenario: string;
  playbook: string;
  risk_level: RiskLevel;
  actions: ActionRecommendation[];
  explanations: string[];
  client_message: string;
}

export interface Scenario extends Resource {
  title: string;
  scenario_type: ScenarioType;
  description: string;
  trigger_source: string;
  client_ids: string[];
  portfolio_ids: string[];
  market_signals: MarketSignal[];
  affected_sectors: string[];
  region?: string | null;
  detected_at: string;
  detection: ScenarioDetectionResult;
  playbook_match: PlaybookMatchResult;
  risk_summary: RiskCheckResult;
  escalation: EscalationResult;
  analysis: AIPlaybookResponse;
  action_record_id?: string | null;
}

export interface ActionRecord extends Resource {
  scenario_id: string;
  playbook_id?: string | null;
  scenario: string;
  playbook: string;
  risk_level: RiskLevel;
  client_ids: string[];
  portfolio_ids: string[];
  actions: ActionRecommendation[];
  explanations: string[];
  client_message: string;
  guardrails: string[];
  approval_status: ApprovalStatus;
  approvals_needed: string[];
  execution_notes?: string | null;
}

export interface ScenarioTriggerPayload {
  title: string;
  scenario_type: ScenarioType;
  description: string;
  trigger_source: string;
  client_ids: string[];
  portfolio_ids: string[];
  market_signals: MarketSignal[];
  affected_sectors: string[];
  region?: string;
  severity_hint?: RiskLevel;
}

export interface PlaybookCreatePayload {
  name: string;
  scenario_type: ScenarioType;
  description: string;
  trigger_conditions: string[];
  impacted_clients: string[];
  risk_checks: string[];
  recommended_actions: string[];
  communication_templates: CommunicationTemplate[];
  guardrails: string[];
  escalation_rules: string[];
  approval_workflow: ApprovalWorkflowStep[];
  review_metrics: ReviewMetric[];
  tags: string[];
}
