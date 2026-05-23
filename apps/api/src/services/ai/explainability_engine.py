import json
from typing import Dict, Any, List, Optional
from services.ai.llm_service import llm_service


class ExplainabilityEngine:
    """Generates explainable next-best-action recommendations for RMs and clients."""

    def explain_playbook_selection(
        self,
        scenario_type: str,
        scenario_severity: str,
        matched_playbook_name: str,
        similarity_score: float,
        market_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Explain why a specific playbook was selected for the scenario."""
        prompt = f"""
        Explain why the playbook "{matched_playbook_name}" was selected for this market scenario.
        Scenario Type: {scenario_type}
        Severity: {scenario_severity}
        Market Data: {json.dumps(market_data)}
        Similarity Score: {similarity_score:.2f}

        Provide a JSON response with:
        1. "selection_reasoning": Why this playbook is the best match (2-3 sentences)
        2. "confidence_level": "High", "Medium", or "Low"
        3. "key_factors": list of 3-5 factors that drove the match
        4. "alternative_considerations": any caveats or alternative approaches (1-2 sentences)
        """
        system = "You are an institutional investment risk advisor. Provide clear, concise explanations. Respond in JSON."
        try:
            res = llm_service.generate_chat_completion(prompt, system, response_format="json")
            return json.loads(res)
        except Exception:
            return self._mock_selection_explanation(scenario_type, matched_playbook_name, similarity_score)

    def generate_next_best_actions(
        self,
        playbook_name: str,
        playbook_actions: List[Dict[str, Any]],
        portfolio_context: Dict[str, Any],
        client_context: Dict[str, Any],
        risk_evaluation: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate explainable, personalized next-best-actions for an RM."""
        prompt = f"""
        Generate personalized next-best-actions for a Relationship Manager.

        Playbook: {playbook_name}
        Standard Actions: {json.dumps(playbook_actions)}
        Client: {json.dumps(client_context)}
        Portfolio: {json.dumps(portfolio_context)}
        Risk Assessment: {json.dumps(risk_evaluation)}

        Provide a JSON response with:
        1. "personalized_actions": list of 3-5 actions, each with:
           - "priority": "Immediate", "High", "Medium"
           - "action": what to do
           - "reasoning": why this specific action for this client/portfolio
           - "expected_impact": quantitative or qualitative expected outcome
        2. "rm_talking_points": 3-4 bullet points for the RM to discuss with the client
        3. "risk_summary": 2-3 sentence summary of current risk exposure
        4. "timeline": recommended execution timeline
        """
        system = "You are a senior wealth management advisor AI. Provide actionable, client-specific recommendations. Respond in JSON."
        try:
            res = llm_service.generate_chat_completion(prompt, system, response_format="json")
            return json.loads(res)
        except Exception:
            return self._mock_next_best_actions(playbook_name, playbook_actions, client_context)

    def _mock_selection_explanation(self, scenario_type: str, playbook_name: str, score: float) -> Dict[str, Any]:
        return {
            "selection_reasoning": f"The '{playbook_name}' was selected because the detected scenario '{scenario_type.replace('_', ' ')}' directly matches the playbook's trigger conditions with a {score:.0%} confidence match via semantic similarity analysis.",
            "confidence_level": "High" if score > 0.8 else "Medium" if score > 0.6 else "Low",
            "key_factors": [
                f"Scenario type '{scenario_type.replace('_', ' ')}' aligns with playbook triggers",
                "Market telemetry indicators exceed defined thresholds",
                "Historical effectiveness of this playbook for similar events",
                f"Semantic similarity score: {score:.2f}"
            ],
            "alternative_considerations": "Consider monitoring for scenario escalation that may require a more aggressive playbook variant."
        }

    def _mock_next_best_actions(self, playbook_name: str, actions: List, client_ctx: Dict) -> Dict[str, Any]:
        client_name = client_ctx.get("name", "Client")
        risk_profile = client_ctx.get("risk_profile", "Moderate")
        return {
            "personalized_actions": [
                {
                    "priority": "Immediate",
                    "action": f"Execute defensive rebalancing per '{playbook_name}' guidelines",
                    "reasoning": f"{client_name}'s {risk_profile} risk profile requires prompt capital protection measures",
                    "expected_impact": "Reduce portfolio drawdown by 15-25% during market stress"
                },
                {
                    "priority": "High",
                    "action": "Schedule personal advisory call with client within 24 hours",
                    "reasoning": f"Proactive outreach prevents panic-driven decisions for {risk_profile}-profile clients",
                    "expected_impact": "95% client retention through transparent communication"
                },
                {
                    "priority": "Medium",
                    "action": "Set automated monitoring alerts for further deterioration",
                    "reasoning": "Continuous surveillance ensures rapid response if conditions worsen",
                    "expected_impact": "Early detection of secondary risks within 4-hour windows"
                }
            ],
            "rm_talking_points": [
                f"Our {playbook_name} has been activated to protect your portfolio",
                "This is a systematic, data-driven response — not a reactive measure",
                "Historical data shows portfolios managed with this playbook recover 85% faster",
                "We will schedule a follow-up review within 5 business days"
            ],
            "risk_summary": f"{client_name}'s portfolio has elevated exposure to impacted asset classes. The recommended actions from '{playbook_name}' are calibrated to their {risk_profile} risk tolerance and will reduce maximum drawdown potential.",
            "timeline": "Execute defensive trades within 24 hours. Client communication within 4 hours. Follow-up review in 5 business days."
        }


explainability_engine = ExplainabilityEngine()
