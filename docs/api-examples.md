# API examples

## Trigger a scenario

```http
POST /api/v1/scenarios
Content-Type: application/json
```

```json
{
  "title": "Broad equity drawdown alert",
  "scenario_type": "market_crash",
  "description": "Indices are down sharply and inbound client concern is rising.",
  "trigger_source": "manual",
  "client_ids": [],
  "portfolio_ids": [],
  "market_signals": [
    {
      "metric": "S&P 500 drawdown",
      "value": "-8.1%",
      "note": "High volatility and widening spreads"
    }
  ],
  "affected_sectors": ["technology", "financials"],
  "region": "United States",
  "severity_hint": "high"
}
```

## Create a playbook

```http
POST /api/v1/playbooks
Content-Type: application/json
```

```json
{
  "name": "Advisor Stability Playbook",
  "scenario_type": "market_crash",
  "description": "Structured response path for fast-moving risk events.",
  "trigger_conditions": ["Client inbound volume spikes"],
  "impacted_clients": ["high_touch_relationships"],
  "risk_checks": ["Verify liquidity"],
  "recommended_actions": ["Prioritize at-risk households for outreach"],
  "communication_templates": [
    {
      "channel": "email",
      "audience": "clients",
      "subject": "Portfolio update",
      "body": "We are reviewing your portfolio and will follow up with account-specific guidance."
    }
  ],
  "guardrails": ["Do not force liquidation without advisor review."],
  "escalation_rules": ["Escalate if risk is high or critical."],
  "approval_workflow": [
    {
      "role": "Lead Advisor",
      "order": 1,
      "required": true,
      "sla_hours": 2
    }
  ],
  "review_metrics": [
    {
      "name": "Response SLA",
      "target": "<= 30 min",
      "description": "Time to initial client communication."
    }
  ],
  "tags": ["market_crash", "custom"]
}
```
