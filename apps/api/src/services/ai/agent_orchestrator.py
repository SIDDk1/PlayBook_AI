import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from models.scenario import Scenario
from models.portfolio import Portfolio, Client
from models.playbook import Playbook
from services.ai.llm_service import llm_service
from services.ai.rag_pipeline import search_playbooks
from services.ai.explainability_engine import explainability_engine

class MultiAgentOrchestrator:
    def __init__(self, db: Session):
        self.db = db

    def run_scenarios_pipeline(self, scenario: Scenario) -> Dict[str, Any]:
        # Step 1: Market Agent - analyze the market situation
        market_analysis = self._run_market_agent(scenario)

        # Step 2: Playbook Agent - RAG search for relevant playbooks
        matched_playbooks = self._run_playbook_agent(scenario, market_analysis)

        # Step 3: Risk Agent - stress test portfolios for matching asset classes and playbook risk checks
        risk_evaluation = self._run_risk_agent(scenario, market_analysis, matched_playbooks)

        # Step 4: Compliance Agent - verify restrictions and guardrails on matched playbooks
        compliance_check = self._run_compliance_agent(matched_playbooks, risk_evaluation)

        # Step 5: Communication Agent - generate client notice drafts
        communication_drafts = self._run_communication_agent(market_analysis, risk_evaluation, matched_playbooks)

        # Step 6: Escalation Agent - define approval levels based on playbook rules
        escalation_workflow = self._run_escalation_agent(scenario, risk_evaluation, compliance_check, matched_playbooks)

        # Step 7: Explainability Agent - selection and next best action explanations
        explainability = self._run_explainability_agent(scenario, matched_playbooks, risk_evaluation)

        return {
            "market_analysis": market_analysis,
            "matched_playbooks": [
                {
                    "id": p[0].id,
                    "name": p[0].name,
                    "similarity": p[1],
                    "actions": p[0].actions,
                    "category": getattr(p[0], "category", None)
                } for p in matched_playbooks
            ],
            "risk_evaluation": risk_evaluation,
            "compliance_check": compliance_check,
            "communication_drafts": communication_drafts,
            "escalation_workflow": escalation_workflow,
            "explainability": explainability
        }

    def _run_market_agent(self, scenario: Scenario) -> Dict[str, Any]:
        prompt = f"""
        Classify this market scenario:
        Type: {scenario.type}
        Severity: {scenario.severity}
        Telemetry: {json.dumps(scenario.market_data)}
        
        Extract the following as JSON:
        1. impacted_asset_classes (list of strings, e.g., ["Equity", "Fixed Income"])
        2. primary_indicators (dict of extracted variables)
        3. macro_summary (brief description of market impact)
        """
        system_instruction = "You are an institutional Market Classifier Agent. Format output as JSON."
        try:
            res = llm_service.generate_chat_completion(prompt, system_instruction, response_format="json")
            return json.loads(res)
        except Exception:
            return {
                "impacted_asset_classes": ["Equity"],
                "primary_indicators": {"index_drop": -0.12},
                "macro_summary": "Standard equity drawdown situation."
            }

    def _run_playbook_agent(self, scenario: Scenario, market_analysis: Dict[str, Any]) -> List[Any]:
        # Formulate search query based on market analysis
        query = f"{scenario.type} {scenario.severity} {' '.join(market_analysis.get('impacted_asset_classes', []))}"
        return search_playbooks(self.db, query, limit=2)

    def _run_risk_agent(
        self, scenario: Scenario, market_analysis: Dict[str, Any], matched_playbooks: List[Any] = None
    ) -> Dict[str, Any]:
        portfolios = self.db.query(Portfolio).all()
        impacted_asset_classes = market_analysis.get("impacted_asset_classes", [])
        
        # Extract risk checks from the matched playbook
        risk_checks = []
        if matched_playbooks and len(matched_playbooks) > 0:
            playbook = matched_playbooks[0][0]
            risk_checks = getattr(playbook, "risk_checks", []) or []

        impacted_portfolios = []
        high_risk_portfolios = 0
        
        for p in portfolios:
            exposure_value = 0.0
            total_value = p.total_value or 1.0
            
            # Compute exposure based on asset classes
            for asset in p.assets:
                if asset.get("asset_class") in impacted_asset_classes:
                    exposure_value += asset.get("value", 0.0)
            
            exposure_pct = exposure_value / total_value
            risk_score = p.risk_score
            
            # Base concentration breach
            breach = False
            if exposure_pct > 0.35:
                breach = True
                
            # Evaluate playbook-specific risk checks dynamically
            triggered_checks = []
            for check_rule in risk_checks:
                check_name = check_rule.get("check")
                threshold = check_rule.get("threshold", 0.0)
                action = check_rule.get("action", "flag")
                
                rule_triggered = False
                current_val = 0.0
                
                if check_name == "equity_exposure_limit":
                    equity_value = sum(a.get("value", 0.0) for a in p.assets if a.get("asset_class") == "Equity")
                    current_val = round(equity_value / total_value, 2)
                    if current_val > threshold:
                        rule_triggered = True
                        
                elif check_name == "portfolio_var":
                    # Mock Value at Risk based on risk_score
                    current_val = round(0.02 + (risk_score * 0.02), 3)
                    if current_val > threshold:
                        rule_triggered = True
                        
                elif check_name == "sector_concentration":
                    # Sum technology exposure as sector concentration
                    tech_value = sum(a.get("value", 0.0) for a in p.assets if a.get("ticker") in ["AAPL", "NVDA"])
                    current_val = round(tech_value / total_value, 2)
                    if current_val > threshold:
                        rule_triggered = True
                        
                elif check_name == "single_stock_exposure" or check_name == "single_name_risk":
                    max_single = max((a.get("value", 0.0) / total_value for a in p.assets), default=0.0)
                    current_val = round(max_single, 2)
                    if current_val > threshold:
                        rule_triggered = True
                        
                elif check_name == "duration_exposure":
                    has_fixed_income = any(a.get("asset_class") == "Fixed Income" for a in p.assets)
                    if has_fixed_income:
                        current_val = round(8.0 - (risk_score * 0.5), 1)
                    else:
                        current_val = 0.0
                    if current_val > threshold:
                        rule_triggered = True
                        
                elif check_name == "illiquid_asset_ratio":
                    alt_value = sum(a.get("value", 0.0) for a in p.assets if a.get("asset_class") in ["Alternatives", "Private Equity", "Venture Capital"])
                    current_val = round(alt_value / total_value, 2)
                    if current_val > threshold:
                        rule_triggered = True
                        
                elif check_name == "cash_buffer":
                    cash_value = sum(a.get("value", 0.0) for a in p.assets if a.get("asset_class") in ["Cash", "CASH"])
                    current_val = round(cash_value / total_value, 2)
                    if current_val < threshold:  # Triggered if below cash threshold
                        rule_triggered = True
                        
                elif check_name == "redemption_queue":
                    current_val = round(0.1 + (risk_score * 0.02), 2)
                    if current_val > threshold:
                        rule_triggered = True
                
                if rule_triggered:
                    triggered_checks.append({
                        "check": check_name,
                        "threshold": threshold,
                        "current_value": current_val,
                        "action": action
                    })
                    if action in ["escalate", "rebalance", "flag"]:
                        breach = True
            
            if breach:
                high_risk_portfolios += 1

            impacted_portfolios.append({
                "portfolio_id": p.id,
                "portfolio_name": p.name,
                "exposure_pct": round(exposure_pct, 2),
                "risk_score": risk_score,
                "concentration_breach": breach,
                "triggered_risk_checks": triggered_checks
            })

        return {
            "impacted_portfolios_count": len(portfolios),
            "high_risk_portfolios_count": high_risk_portfolios,
            "portfolios_evaluation": impacted_portfolios
        }

    def _run_compliance_agent(self, matched_playbooks: List[Any], risk_evaluation: Dict[str, Any]) -> Dict[str, Any]:
        if not matched_playbooks:
            return {"status": "Approved", "restricted": False, "notes": "No playbook loaded."}
            
        playbook = matched_playbooks[0][0]
        compliance_rules = playbook.compliance_rules or {}
        guardrails = getattr(playbook, "guardrails", {}) or {}
        
        requires_review = False
        notes = "Playbook compliance checked. All checks passed."
        
        if risk_evaluation.get("high_risk_portfolios_count", 0) > 0:
            requires_review = True
            notes = "Flagged: High-risk portfolios require manual review from Compliance Head."
            
        # Validate Guardrails
        guardrail_breaches = []
        restricted_assets = guardrails.get("restricted_asset_classes", [])
        min_cash_buffer = guardrails.get("min_cash_buffer_pct", 0.0)
        
        # Evaluate portfolios against these guardrails
        portfolios_eval = risk_evaluation.get("portfolios_evaluation", [])
        for p_eval in portfolios_eval:
            p = self.db.query(Portfolio).filter(Portfolio.id == p_eval["portfolio_id"]).first()
            if not p:
                continue
            
            # Check restricted asset classes
            for asset in p.assets:
                asset_cls = asset.get("asset_class")
                if asset_cls in restricted_assets:
                    requires_review = True
                    guardrail_breaches.append(f"Portfolio '{p.name}' holds restricted asset class '{asset_cls}'")
            
            # Check cash buffer
            if min_cash_buffer > 0.0:
                cash_val = sum(a.get("value", 0.0) for a in p.assets if a.get("asset_class") in ["Cash", "CASH"])
                cash_pct = cash_val / (p.total_value or 1.0)
                if cash_pct < min_cash_buffer:
                    requires_review = True
                    guardrail_breaches.append(f"Portfolio '{p.name}' cash buffer {cash_pct:.2f} is below guardrail limit {min_cash_buffer:.2f}")
                    
        if guardrail_breaches:
            notes = f"Compliance Review Required. Guardrail Breaches detected: {'; '.join(guardrail_breaches)}"

        return {
            "status": "ReviewRequired" if requires_review else "Approved",
            "compliance_rules_applied": compliance_rules,
            "guardrails_applied": guardrails,
            "guardrail_breaches": guardrail_breaches,
            "notes": notes
        }

    def _run_communication_agent(
        self, market_analysis: Dict[str, Any], risk_evaluation: Dict[str, Any], matched_playbooks: List[Any]
    ) -> Dict[str, Any]:
        playbook = matched_playbooks[0][0] if matched_playbooks else None
        playbook_name = playbook.name if playbook else "Standard Playbook"
        
        # Check if playbook has specific communication templates
        templates = getattr(playbook, "client_communication_templates", {}) if playbook else {}
        if templates and templates.get("body"):
            # Personalize with first client in the database
            portfolios_eval = risk_evaluation.get("portfolios_evaluation", [])
            client_name = "Valued Client"
            if portfolios_eval:
                p = self.db.query(Portfolio).filter(Portfolio.id == portfolios_eval[0]["portfolio_id"]).first()
                if p and p.client:
                    client_name = p.client.name
            
            subject = templates.get("subject", "Private Wealth Alert").replace("{client_name}", client_name)
            body = templates.get("body", "").replace("{client_name}", client_name)
            tone = templates.get("tone", "Professional")
            
            return {
                "subject": subject,
                "body": body,
                "tone": tone,
                "source": "playbook_template",
                "personalized_for": client_name
            }
            
        # Fallback to LLM dynamic generation
        prompt = f"""
        Draft a high-end wealth advisory client notification.
        Context:
        Market Situation: {market_analysis.get('macro_summary', 'Volatile markets')}
        Recommended Playbook: {playbook_name}
        High risk portfolios detected: {risk_evaluation.get('high_risk_portfolios_count', 0)}
        
        Provide:
        1. subject: Professional email subject line
        2. body: Structured email detailing defensive allocations and capital protection.
        """
        system_instruction = "You are a Goldman Sachs private wealth advisor communication bot. Respond in JSON."
        try:
            res = llm_service.generate_chat_completion(prompt, system_instruction, response_format="json")
            data = json.loads(res)
            data["source"] = "llm_generated"
            return data
        except Exception:
            return {
                "subject": f"Private Wealth Alert: Portfolio Reallocation",
                "body": f"In response to recent market movements and our {playbook_name}, we are recommending defensive weight adjustments.",
                "source": "fallback"
            }

    def _run_escalation_agent(
        self, scenario: Scenario, risk_evaluation: Dict[str, Any], compliance_check: Dict[str, Any], matched_playbooks: List[Any] = None
    ) -> List[str]:
        # Determine approval hierarchy
        approvals = ["RelationshipManager"]  # Base level
        
        # Check if playbook approval workflow is defined
        if matched_playbooks and len(matched_playbooks) > 0:
            playbook = matched_playbooks[0][0]
            if getattr(playbook, "approval_workflow", None):
                return list(playbook.approval_workflow)
            
            # Check playbook escalation rules
            escalation_rules = getattr(playbook, "escalation_rules", {}) or {}
            if escalation_rules:
                severity_threshold = escalation_rules.get("severity_threshold")
                auto_escalate_roles = escalation_rules.get("auto_escalate_roles", [])
                portfolio_value_threshold = escalation_rules.get("portfolio_value_threshold", 0)
                
                trigger_escalation = False
                if severity_threshold == "Critical" and scenario.severity == "Critical":
                    trigger_escalation = True
                elif severity_threshold == "Warning" and scenario.severity in ["Warning", "Critical"]:
                    trigger_escalation = True
                    
                if portfolio_value_threshold > 0:
                    portfolios_eval = risk_evaluation.get("portfolios_evaluation", [])
                    for p_eval in portfolios_eval:
                        p = self.db.query(Portfolio).filter(Portfolio.id == p_eval["portfolio_id"]).first()
                        if p and p.total_value >= portfolio_value_threshold:
                            trigger_escalation = True
                            
                if trigger_escalation:
                    for role in auto_escalate_roles:
                        if role not in approvals:
                            approvals.append(role)
                    return approvals
        
        # Fallback to hardcoded escalation rules
        if scenario.severity in ["Warning", "Critical"] or risk_evaluation.get("high_risk_portfolios_count", 0) > 0:
            approvals.append("RiskOfficer")
            
        if compliance_check.get("status") == "ReviewRequired" or scenario.severity == "Critical":
            approvals.append("ComplianceHead")
            
        return approvals

    def _run_explainability_agent(
        self, scenario: Scenario, matched_playbooks: List[Any], risk_evaluation: Dict[str, Any]
    ) -> Dict[str, Any]:
        if not matched_playbooks:
            return {}
        
        playbook = matched_playbooks[0][0]
        similarity = matched_playbooks[0][1]
        
        selection_explanation = explainability_engine.explain_playbook_selection(
            scenario_type=scenario.type,
            scenario_severity=scenario.severity,
            matched_playbook_name=playbook.name,
            similarity_score=similarity,
            market_data=scenario.market_data
        )
        
        portfolios_eval = risk_evaluation.get("portfolios_evaluation", [])
        if portfolios_eval:
            top_portfolio_eval = portfolios_eval[0]
            portfolio_id = top_portfolio_eval["portfolio_id"]
            portfolio = self.db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
            if portfolio:
                client = portfolio.client
                client_context = {
                    "name": client.name,
                    "risk_profile": client.risk_profile,
                    "segment": client.segment
                }
                portfolio_context = {
                    "name": portfolio.name,
                    "total_value": portfolio.total_value,
                    "risk_score": portfolio.risk_score,
                    "assets": portfolio.assets
                }
                
                nba = explainability_engine.generate_next_best_actions(
                    playbook_name=playbook.name,
                    playbook_actions=playbook.actions,
                    portfolio_context=portfolio_context,
                    client_context=client_context,
                    risk_evaluation=top_portfolio_eval
                )
                
                return {
                    "selection_explainability": selection_explanation,
                    "next_best_actions": nba,
                    "target_portfolio_id": portfolio_id,
                    "target_client_name": client.name
                }
                
        return {
            "selection_explainability": selection_explanation,
            "next_best_actions": {}
        }
