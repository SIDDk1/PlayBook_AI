from __future__ import annotations

from app.models.common import ScenarioType


DEFAULT_PLAYBOOKS = [
    {
        "name": "Crash Response and Reassurance",
        "scenario_type": ScenarioType.MARKET_CRASH.value,
        "description": "Coordinate advisor response during broad market drawdowns with liquidity triage and client messaging.",
        "trigger_conditions": [
            "Major index drawdown exceeds 7% intraday",
            "Client inbound volume spikes above baseline",
            "Volatility index breaks risk threshold",
        ],
        "impacted_clients": ["retirees", "income_accounts", "high_touch_relationships"],
        "risk_checks": [
            "Confirm cash runway for 90 days",
            "Review concentrated cyclical exposure",
            "Pause discretionary tax-loss harvesting if liquidity is constrained",
        ],
        "recommended_actions": [
            "Prioritize at-risk retirees and near-term withdrawal clients for outreach.",
            "Reassess tactical cash buffers before any portfolio changes.",
            "Queue portfolio hedging review for high-beta accounts.",
        ],
        "communication_templates": [
            {
                "channel": "email",
                "audience": "clients",
                "subject": "Your portfolio and today's market move",
                "body": "We are reviewing your portfolio against current volatility and will reach out with account-specific guidance.",
            }
        ],
        "guardrails": [
            "Do not recommend liquidating diversified long-term positions solely due to intraday panic.",
            "Critical scenarios require senior advisor approval before execution.",
        ],
        "escalation_rules": [
            "Escalate if liquidity buffer falls below 5%.",
            "Escalate if client requests full liquidation.",
        ],
        "approval_workflow": [
            {"role": "Lead Advisor", "order": 1, "required": True, "sla_hours": 2},
            {"role": "Risk Officer", "order": 2, "required": True, "sla_hours": 4},
        ],
        "review_metrics": [
            {"name": "Client retention", "target": ">= 98%", "description": "Retain client confidence during the event."},
            {"name": "Response SLA", "target": "<= 30 min", "description": "Time to first advisor touchpoint."},
        ],
        "tags": ["market selloff", "volatility", "liquidity"],
    },
    {
        "name": "Sector Rotation Defense",
        "scenario_type": ScenarioType.SECTOR_CORRECTION.value,
        "description": "Respond to sharp drawdowns in a single sector while preserving long-term asset allocation discipline.",
        "trigger_conditions": [
            "Sector ETF drops more than 10% in 5 sessions",
            "Portfolio sector weight exceeds policy range",
        ],
        "impacted_clients": ["growth_accounts", "single-theme investors"],
        "risk_checks": [
            "Review sector concentration limits",
            "Assess correlation spillover into adjacent holdings",
        ],
        "recommended_actions": [
            "Quantify exposure by client segment and concentration bucket.",
            "Prepare rebalancing options back to policy ranges.",
            "Flag clients with high thematic exposure for call outreach.",
        ],
        "communication_templates": [
            {
                "channel": "call",
                "audience": "clients",
                "subject": "Sector-specific portfolio update",
                "body": "We are evaluating the sector move in the context of your diversified allocation and rebalancing guardrails.",
            }
        ],
        "guardrails": ["Do not average down without verifying policy allocation bands."],
        "escalation_rules": ["Escalate if any sector exceeds 35% of portfolio value."],
        "approval_workflow": [{"role": "Portfolio Manager", "order": 1, "required": True, "sla_hours": 4}],
        "review_metrics": [
            {"name": "Rebalance completion", "target": ">= 90%", "description": "Target completion for approved rebalances."}
        ],
        "tags": ["sector", "technology", "energy", "financials"],
    },
    {
        "name": "Rates Shock Response",
        "scenario_type": ScenarioType.INTEREST_RATE_CHANGE.value,
        "description": "Adjust fixed income, duration, and communication posture after central bank surprises.",
        "trigger_conditions": [
            "Unexpected rate hike or cut",
            "Treasury yield curve shifts beyond 25 bps in a session",
        ],
        "impacted_clients": ["income_accounts", "bond_ladders", "conservative_clients"],
        "risk_checks": ["Review duration mismatch", "Assess floating-rate exposure", "Check refinancing-sensitive holdings"],
        "recommended_actions": [
            "Review duration bands across fixed income sleeves.",
            "Model yield sensitivity for client cash flow plans.",
            "Prepare advisor notes on reinvestment implications.",
        ],
        "communication_templates": [
            {
                "channel": "email",
                "audience": "clients",
                "subject": "Interest rate update",
                "body": "We are reviewing how the rate move affects your income strategy, duration profile, and planned withdrawals.",
            }
        ],
        "guardrails": ["Avoid blanket duration changes without client cash flow review."],
        "escalation_rules": ["Escalate if duration gap exceeds policy tolerance."],
        "approval_workflow": [{"role": "Fixed Income Lead", "order": 1, "required": True, "sla_hours": 6}],
        "review_metrics": [
            {"name": "Duration alignment", "target": "100%", "description": "Portfolios aligned to approved duration bands."}
        ],
        "tags": ["rates", "duration", "bonds"],
    },
    {
        "name": "Liquidity Stress Containment",
        "scenario_type": ScenarioType.LIQUIDITY_STRESS.value,
        "description": "Stabilize portfolios with low liquidity coverage or redemption pressure.",
        "trigger_conditions": [
            "Cash ratio below policy floor",
            "Large redemption requests cluster in one day",
        ],
        "impacted_clients": ["withdrawal_clients", "alternative_allocations"],
        "risk_checks": ["Check same-day liquidity", "Review private asset redemption gates"],
        "recommended_actions": [
            "Freeze non-essential tactical trades until liquidity is confirmed.",
            "Rank positions by sellability and tax impact.",
            "Escalate withdrawal sequencing plan to the advisor lead.",
        ],
        "communication_templates": [
            {
                "channel": "call",
                "audience": "clients",
                "subject": "Liquidity planning update",
                "body": "We are sequencing any required changes to protect your liquidity needs without forcing unnecessary sales.",
            }
        ],
        "guardrails": ["No execution until withdrawal needs and liquidity tiers are validated."],
        "escalation_rules": ["Always escalate if cash ratio drops below 3%."],
        "approval_workflow": [
            {"role": "Lead Advisor", "order": 1, "required": True, "sla_hours": 1},
            {"role": "Chief Risk Officer", "order": 2, "required": True, "sla_hours": 2},
        ],
        "review_metrics": [
            {"name": "Liquidity coverage", "target": ">= 1.0x", "description": "Coverage of near-term cash needs."}
        ],
        "tags": ["liquidity", "redemption", "cash"],
    },
    {
        "name": "Earnings Event Watchtower",
        "scenario_type": ScenarioType.EARNINGS_VOLATILITY.value,
        "description": "Manage concentrated single-name risk around earnings season.",
        "trigger_conditions": ["Portfolio holds high-weight positions heading into earnings.", "Guidance revisions create price gaps."],
        "impacted_clients": ["equity_traders", "concentrated_equity"],
        "risk_checks": ["Review single-name limit", "Check options and derivatives overlays"],
        "recommended_actions": [
            "Prepare pre-earnings risk memo for concentrated names.",
            "Stress-test downside scenarios for top holdings.",
            "Document hold, trim, and hedge options for advisor review.",
        ],
        "communication_templates": [
            {
                "channel": "email",
                "audience": "clients",
                "subject": "Earnings volatility review",
                "body": "We are reviewing the earnings event in the context of your position size and broader allocation.",
            }
        ],
        "guardrails": ["Do not trade around earnings without documenting rationale and client suitability."],
        "escalation_rules": ["Escalate if single issuer exposure exceeds 20%."],
        "approval_workflow": [{"role": "Portfolio Manager", "order": 1, "required": True, "sla_hours": 4}],
        "review_metrics": [
            {"name": "Concentration exceptions", "target": "0", "description": "No unapproved single-name breaches."}
        ],
        "tags": ["earnings", "single-name", "equity risk"],
    },
    {
        "name": "Geopolitical Shock Protocol",
        "scenario_type": ScenarioType.GEOPOLITICAL_EVENT.value,
        "description": "Assess cross-asset impact from geopolitical shocks and keep client communication disciplined.",
        "trigger_conditions": ["Sanctions, conflict, or election shock moves markets rapidly."],
        "impacted_clients": ["global_allocations", "emerging_market_exposure"],
        "risk_checks": ["Review country and currency exposure", "Check ADR and depository risk"],
        "recommended_actions": [
            "Map portfolio exposure to affected geographies and sectors.",
            "Review FX hedges and safe-haven positioning.",
            "Draft tailored client outreach by region exposure.",
        ],
        "communication_templates": [
            {
                "channel": "email",
                "audience": "clients",
                "subject": "Market update on geopolitical developments",
                "body": "We are assessing the event's impact on your allocations and will communicate any recommended changes with context.",
            }
        ],
        "guardrails": ["Avoid reactionary trading on unverified headlines."],
        "escalation_rules": ["Escalate when event affects sanctioned or restricted securities."],
        "approval_workflow": [{"role": "Compliance Lead", "order": 1, "required": True, "sla_hours": 3}],
        "review_metrics": [
            {"name": "Exposure mapping", "target": "100%", "description": "All impacted accounts mapped within the same business day."}
        ],
        "tags": ["geopolitical", "fx", "global"],
    },
    {
        "name": "Credit Quality Response",
        "scenario_type": ScenarioType.CREDIT_DOWNGRADE.value,
        "description": "Respond to issuer downgrades affecting fixed income or credit-sensitive holdings.",
        "trigger_conditions": ["Issuer rating downgraded materially", "Spread widening exceeds risk band"],
        "impacted_clients": ["credit_income", "balanced_income"],
        "risk_checks": ["Review downgrade covenant triggers", "Re-evaluate spread compensation"],
        "recommended_actions": [
            "Review downgrade impact on yield, liquidity, and policy eligibility.",
            "Identify replacement candidates within mandate.",
            "Prepare client-safe explanation of credit deterioration.",
        ],
        "communication_templates": [
            {
                "channel": "email",
                "audience": "clients",
                "subject": "Credit event update",
                "body": "We are reviewing the downgrade and its implications for the holdings in your portfolio.",
            }
        ],
        "guardrails": ["Do not hold downgraded credits outside mandate without approval."],
        "escalation_rules": ["Escalate all below-investment-grade transitions."],
        "approval_workflow": [
            {"role": "Fixed Income Lead", "order": 1, "required": True, "sla_hours": 2},
            {"role": "Compliance Lead", "order": 2, "required": True, "sla_hours": 6},
        ],
        "review_metrics": [
            {"name": "Mandate compliance", "target": "100%", "description": "Downgraded credits reviewed within mandate."}
        ],
        "tags": ["credit", "downgrade", "fixed income"],
    },
    {
        "name": "Behavioral Coaching Path",
        "scenario_type": ScenarioType.CLIENT_PANIC_SELLING.value,
        "description": "Structure advisor intervention when client behavior signals panic-selling risk.",
        "trigger_conditions": ["Client requests immediate liquidation", "Repeated fear-driven contact in volatile market"],
        "impacted_clients": ["anxious_clients", "recent_onboardings"],
        "risk_checks": ["Confirm suitability concerns", "Review cash need urgency"],
        "recommended_actions": [
            "Schedule live advisor conversation before any execution decision.",
            "Document the client's stated concern and timeline.",
            "Prepare downside, recovery, and cash-need scenarios for discussion.",
        ],
        "communication_templates": [
            {
                "channel": "call",
                "audience": "clients",
                "subject": "Let's review your next step carefully",
                "body": "Before making any portfolio changes, we want to walk through your objectives, timing needs, and the trade-offs of selling in stress.",
            }
        ],
        "guardrails": ["Do not execute fear-based liquidation without documented advisor review."],
        "escalation_rules": ["Escalate if requested liquidation exceeds 20% of household assets."],
        "approval_workflow": [{"role": "Lead Advisor", "order": 1, "required": True, "sla_hours": 1}],
        "review_metrics": [
            {"name": "Behavioral retention", "target": ">= 95%", "description": "Clients retained in plan after coaching outreach."}
        ],
        "tags": ["behavioral", "panic", "client outreach"],
    },
    {
        "name": "Concentration Breach Remediation",
        "scenario_type": ScenarioType.PORTFOLIO_CONCENTRATION_BREACH.value,
        "description": "Triage accounts that drift beyond issuer, sector, or thematic concentration thresholds.",
        "trigger_conditions": ["Single holding breaches 25%", "Sector weight breaches 35%"],
        "impacted_clients": ["equity_compensation", "legacy_positions"],
        "risk_checks": ["Review tax implications", "Review lockups and restricted shares"],
        "recommended_actions": [
            "Prepare phased trim or hedge options for approval.",
            "Score each breach by tax cost and liquidity profile.",
            "Coordinate advisor outreach with a diversification narrative.",
        ],
        "communication_templates": [
            {
                "channel": "email",
                "audience": "clients",
                "subject": "Portfolio concentration review",
                "body": "We have identified a concentration drift and are evaluating ways to bring the portfolio back within guardrails thoughtfully.",
            }
        ],
        "guardrails": ["Do not propose large concentration trims without tax-aware review."],
        "escalation_rules": ["Escalate if issuer exposure exceeds 35%."],
        "approval_workflow": [
            {"role": "Portfolio Manager", "order": 1, "required": True, "sla_hours": 4},
            {"role": "Tax Specialist", "order": 2, "required": False, "sla_hours": 8},
        ],
        "review_metrics": [
            {"name": "Concentration resolution", "target": ">= 80%", "description": "Approved breaches mitigated within review window."}
        ],
        "tags": ["concentration", "tax aware", "diversification"],
    },
]


DEFAULT_CLIENTS = [
    {
        "name": "Priya Capital Family Office",
        "segment": "UHNW",
        "risk_tolerance": "moderate",
        "advisor_owner": "Anika Shah",
        "behavior_flags": ["high_touch"],
        "preferences": {"communication_channel": "email", "preferred_contact_time": "early_morning"},
        "assets_under_advice": 24000000,
    },
    {
        "name": "Horizon Retirement Trust",
        "segment": "Retirement",
        "risk_tolerance": "conservative",
        "advisor_owner": "Marcus Lee",
        "behavior_flags": ["income_priority"],
        "preferences": {"communication_channel": "call", "preferred_contact_time": "midday"},
        "assets_under_advice": 9800000,
    },
    {
        "name": "Northbridge Growth Partners",
        "segment": "Growth",
        "risk_tolerance": "aggressive",
        "advisor_owner": "Sara Patel",
        "behavior_flags": ["concentrated_equity"],
        "preferences": {"communication_channel": "email", "preferred_contact_time": "late_afternoon"},
        "assets_under_advice": 16100000,
    },
]


def portfolio_seed(client_ids: list[str]) -> list[dict]:
    return [
        {
            "client_id": client_ids[0],
            "name": "Family Office Core Allocation",
            "total_value": 18500000,
            "cash_ratio": 8.5,
            "liquidity_score": 72,
            "holdings": [
                {"asset_name": "US Dividend Basket", "sector": "multi_sector", "weight_pct": 22, "liquidity_tier": "high"},
                {"asset_name": "Private Credit Sleeve", "sector": "private_credit", "weight_pct": 18, "liquidity_tier": "low", "credit_rating": "BB"},
                {"asset_name": "Technology Leaders ETF", "sector": "technology", "weight_pct": 17, "liquidity_tier": "high"},
            ],
        },
        {
            "client_id": client_ids[1],
            "name": "Retirement Income Ladder",
            "total_value": 7300000,
            "cash_ratio": 4.0,
            "liquidity_score": 41,
            "holdings": [
                {"asset_name": "Short Duration Treasuries", "sector": "government_bonds", "weight_pct": 30, "liquidity_tier": "high", "credit_rating": "AAA"},
                {"asset_name": "Investment Grade Corporates", "sector": "credit", "weight_pct": 28, "liquidity_tier": "medium", "credit_rating": "A"},
                {"asset_name": "Preferred Income Fund", "sector": "financials", "weight_pct": 16, "liquidity_tier": "medium", "credit_rating": "BBB"},
            ],
        },
        {
            "client_id": client_ids[2],
            "name": "Growth Equity Opportunities",
            "total_value": 12400000,
            "cash_ratio": 5.5,
            "liquidity_score": 58,
            "holdings": [
                {"asset_name": "MegaCap Tech Stock", "sector": "technology", "weight_pct": 31, "liquidity_tier": "high"},
                {"asset_name": "AI Infrastructure Basket", "sector": "technology", "weight_pct": 19, "liquidity_tier": "high"},
                {"asset_name": "Consumer Platform Equity", "sector": "consumer", "weight_pct": 12, "liquidity_tier": "high"},
            ],
        },
    ]
