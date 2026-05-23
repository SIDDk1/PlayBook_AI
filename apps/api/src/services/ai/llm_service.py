import json
from typing import Optional, Dict, Any
from openai import OpenAI
from config.settings import settings

class LLMService:
    def __init__(self):
        self.enabled = bool(settings.OPENAI_API_KEY)
        if self.enabled:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def generate_chat_completion(
        self, 
        prompt: str, 
        system_instruction: str = "You are a senior financial analyst.",
        response_format: Optional[str] = None
    ) -> str:
        if not self.enabled:
            return self._generate_mock_response(prompt, system_instruction, response_format)

        try:
            kwargs = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ]
            }
            if response_format == "json":
                kwargs["response_format"] = {"type": "json_object"}

            response = self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling OpenAI Chat: {e}. Falling back to mock.")
            return self._generate_mock_response(prompt, system_instruction, response_format)

    def _generate_mock_response(
        self, prompt: str, system_instruction: str, response_format: Optional[str]
    ) -> str:
        # Mock logic to generate realistic-looking JSON or text based on keywords in prompt
        prompt_lower = prompt.lower()
        
        # 1. Market Agent Classification
        if "classify" in prompt_lower or "telemetry" in prompt_lower:
            classification = {
                "impacted_asset_classes": ["Equity", "FX"] if "geopolitical" in prompt_lower else ["Fixed Income"] if "interest" in prompt_lower else ["Equity"],
                "primary_indicators": {
                    "vix": 38.2 if "crash" in prompt_lower else 18.5,
                    "index_change": -0.12 if "crash" in prompt_lower else 0.01
                },
                "macro_summary": "Detected significant market drawdown trigger with heightened volatility." if "crash" in prompt_lower else "Standard macro economic rate change environment adjustment."
            }
            if response_format == "json":
                return json.dumps(classification)
            return f"Impacted assets: {classification['impacted_asset_classes']}. Summary: {classification['macro_summary']}"

        # 2. Explainability: Explain Playbook Selection
        elif "matched_playbook_name" in prompt or "explain why" in prompt_lower:
            explanation = {
                "selection_reasoning": "The playbook was selected because the system detected an asset class trigger and market volatility exceeding critical standard deviation bands, matching the playbook's semantic intent with high correlation.",
                "confidence_level": "High",
                "key_factors": [
                    "Asset exposure exceeds risk appetite bounds",
                    "Volatility index spikes beyond historical threshold",
                    "Systematic safe-haven reallocation is optimal"
                ],
                "alternative_considerations": "Monitor credit default swaps and spread widening for further escalation."
            }
            if response_format == "json":
                return json.dumps(explanation)
            return explanation["selection_reasoning"]

        # 3. Explainability: Next Best Actions
        elif "personalized" in prompt_lower or "next-best-actions" in prompt_lower:
            actions = {
                "personalized_actions": [
                    {
                        "priority": "Immediate",
                        "action": "Initiate defensive portfolio reallocation to Treasuries and Gold",
                        "reasoning": "To guard against further tail-risk and preserve principal capital.",
                        "expected_impact": "Prunes active drawdowns by an estimated 15-20%."
                    },
                    {
                        "priority": "High",
                        "action": "Schedule custom review call with the relationship manager",
                        "reasoning": "Keep the client closely aligned and prevent emotive panic sales.",
                        "expected_impact": "Maintains high client trust and sentiment stability."
                    }
                ],
                "rm_talking_points": [
                    "Our system has activated a structured, pre-tested market response playbook.",
                    "We are protecting capital by transitioning to high-quality short-duration bonds.",
                    "Rebalancing is designed to position us for faster recovery when market bottoms."
                ],
                "risk_summary": "Elevated equity beta exposure under current volatility profile.",
                "timeline": "Execute rebalancing within 2 hours. Client outreach within 4 hours."
            }
            if response_format == "json":
                return json.dumps(actions)
            return "Reallocate to Treasuries. Schedule RM review call."

        # 4. Playbook Generation
        elif "generate" in prompt_lower and "playbook" in prompt_lower:
            # Extract scenario keywords for smart mock categorization
            category = "market_crash"
            if "interest" in prompt_lower or "rate" in prompt_lower:
                category = "interest_rate_change"
            elif "sector" in prompt_lower or "tech" in prompt_lower or "correction" in prompt_lower:
                category = "sector_correction"
            elif "liquidity" in prompt_lower:
                category = "liquidity_stress"
            elif "earning" in prompt_lower or "volatility" in prompt_lower:
                category = "earnings_volatility"
            elif "geopolitical" in prompt_lower or "war" in prompt_lower or "sanction" in prompt_lower or "china" in prompt_lower or "taiwan" in prompt_lower:
                category = "geopolitical_event"
            elif "credit" in prompt_lower or "downgrade" in prompt_lower:
                category = "credit_downgrade"
            elif "panic" in prompt_lower or "selling" in prompt_lower:
                category = "client_panic_selling"
            elif "concentration" in prompt_lower or "breach" in prompt_lower:
                category = "portfolio_concentration_breach"

            display_name = category.replace('_', ' ').title()
            playbook = {
                "name": f"AI-Generated {display_name} Playbook",
                "description": f"Auto-generated playbook for scenario: {prompt[:120]}",
                "category": category,
                "trigger_conditions": {"type": category, "auto_generated": True, "confidence": 0.92},
                "impacted_portfolios_clients": {
                    "risk_profiles": ["Aggressive", "Moderate"],
                    "segments": ["HNW", "Ultra-HNW"],
                    "asset_classes": ["Equity", "Fixed Income"]
                },
                "risk_checks": [
                    {"check": "exposure_limit", "threshold": 0.40, "action": "flag"},
                    {"check": "concentration_risk", "threshold": 0.30, "action": "rebalance"}
                ],
                "actions": [
                    {"step": 1, "action_type": "defensive_rebalance", "params": {"sell": "High-risk positions", "buy": "Defensive assets", "amount_pct": 0.15}},
                    {"step": 2, "action_type": "hedge", "params": {"instrument": "Protective options", "coverage_pct": 0.10}},
                    {"step": 3, "action_type": "notify_client", "params": {"template": "risk_advisory"}}
                ],
                "client_communication_templates": {
                    "subject": f"Portfolio Advisory: {display_name} Response Active",
                    "body": f"Dear {{client_name}},\n\nIn response to current {display_name.lower()} conditions, our advisory team has activated protective measures.\n\nWe are implementing defensive rebalancing, strategic hedging, and enhanced monitoring.\n\nBest regards,\nYour Wealth Advisory Team",
                    "tone": "Professional and reassuring"
                },
                "guardrails": {
                    "max_single_trade_pct": 0.20,
                    "restricted_asset_classes": ["Cryptocurrency", "Leveraged ETFs"],
                    "min_cash_buffer_pct": 0.05
                },
                "escalation_rules": {
                    "severity_threshold": "Warning",
                    "portfolio_value_threshold": 2000000,
                    "auto_escalate_roles": ["RiskOfficer"]
                },
                "approval_workflow": ["RelationshipManager", "RiskOfficer"],
                "post_action_review_metrics": [
                    {"metric": "portfolio_recovery_rate", "target": 0.80, "window_days": 30},
                    {"metric": "client_satisfaction_score", "target": 0.85, "window_days": 14}
                ],
                "compliance_rules": {"requires_escalation": True, "restricted_asset_classes": ["Cryptocurrency"]}
            }
            if response_format == "json":
                return json.dumps(playbook)
            return json.dumps(playbook)

        # 5. Communication Notice
        elif "draft" in prompt_lower or "communication" in prompt_lower or "subject" in prompt_lower:
            comm = {
                "subject": "Market Strategy Update: Adjusting Portfolio Weightings",
                "body": "Dear Valued Client,\n\nIn response to active market movements, we have triggered systematic adjustments in your holdings to defend capital and hedge risk.\n\nBest regards,\nSentinel Private Wealth Team"
            }
            if response_format == "json":
                return json.dumps(comm)
            return f"Subject: {comm['subject']}\n\n{comm['body']}"

        # Default fallback
        if response_format == "json":
            return json.dumps({"message": "Successfully processed mock response", "status": "ok"})
        return "Processed request successfully. [Mock Mode]"

llm_service = LLMService()
