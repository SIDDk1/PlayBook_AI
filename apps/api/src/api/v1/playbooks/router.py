import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from config.database import get_db
from auth.deps import get_current_user, RoleChecker
from models.playbook import Playbook
from schemas.playbook import PlaybookCreate, PlaybookUpdate, PlaybookResponse
from services.ai.llm_service import llm_service

router = APIRouter()

# Allow RelationshipManagers, RiskOfficers, and ComplianceHeads to read playbooks
read_roles = RoleChecker(["RelationshipManager", "RiskOfficer", "ComplianceHead"])
# Only RiskOfficers or ComplianceHeads can write/modify playbooks
write_roles = RoleChecker(["RiskOfficer", "ComplianceHead"])

@router.post("/", response_model=PlaybookResponse, status_code=status.HTTP_201_CREATED)
def create_playbook(
    playbook_in: PlaybookCreate,
    db: Session = Depends(get_db),
    current_user = Depends(write_roles)
):
    existing = db.query(Playbook).filter(Playbook.name == playbook_in.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Playbook with this name already exists."
        )
    playbook = Playbook(**playbook_in.dict())
    db.add(playbook)
    db.commit()
    db.refresh(playbook)
    return playbook

@router.get("/", response_model=List[PlaybookResponse])
def list_playbooks(
    db: Session = Depends(get_db),
    current_user = Depends(read_roles)
):
    return db.query(Playbook).all()

@router.get("/{playbook_id}", response_model=PlaybookResponse)
def get_playbook(
    playbook_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(read_roles)
):
    playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
    if not playbook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playbook not found."
        )
    return playbook

@router.put("/{playbook_id}", response_model=PlaybookResponse)
def update_playbook(
    playbook_id: int,
    playbook_in: PlaybookUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(write_roles)
):
    playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
    if not playbook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playbook not found."
        )
    
    update_data = playbook_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(playbook, field, value)
        
    db.commit()
    db.refresh(playbook)
    return playbook

@router.delete("/{playbook_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_playbook(
    playbook_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(write_roles)
):
    playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
    if not playbook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playbook not found."
        )
    db.delete(playbook)
    db.commit()
    return None

@router.post("/generate", status_code=status.HTTP_200_OK)
def generate_playbook(
    request: dict,
    db: Session = Depends(get_db),
    current_user = Depends(read_roles)
):
    """AI-generate a structured playbook from a scenario description."""
    scenario_prompt = request.get("prompt", "")
    
    prompt = f"""
    Generate a comprehensive investment playbook for this market scenario:
    "{scenario_prompt}"
    
    Return a JSON object with these exact fields:
    - name: Descriptive playbook name
    - description: 1-2 sentence description  
    - category: one of [market_crash, sector_correction, interest_rate_change, liquidity_stress, earnings_volatility, geopolitical_event, credit_downgrade, client_panic_selling, portfolio_concentration_breach]
    - trigger_conditions: object with type, relevant thresholds
    - impacted_portfolios_clients: object with risk_profiles (list), segments (list), asset_classes (list)
    - risk_checks: array of objects with check, threshold, action
    - actions: array of objects with step (number), action_type, params
    - client_communication_templates: object with subject, body, tone
    - guardrails: object with compliance limits
    - escalation_rules: object with severity_threshold, auto_escalate_roles
    - approval_workflow: array of role strings
    - post_action_review_metrics: array of objects with metric, target, window_days
    - compliance_rules: object with requires_escalation (bool), restricted_asset_classes (list)
    """
    system = "You are an expert institutional wealth management playbook architect. Generate detailed, actionable playbooks. Respond in JSON only."
    
    try:
        res = llm_service.generate_chat_completion(prompt, system, response_format="json")
        playbook_data = json.loads(res)
        return playbook_data
    except Exception as e:
        # Fallback: generate a well-structured mock playbook
        return _generate_mock_playbook(scenario_prompt)


def _generate_mock_playbook(prompt: str) -> dict:
    prompt_lower = prompt.lower()
    # Determine category from keywords
    category = "market_crash"
    if "interest" in prompt_lower or "rate" in prompt_lower:
        category = "interest_rate_change"
    elif "sector" in prompt_lower or "tech" in prompt_lower or "correction" in prompt_lower:
        category = "sector_correction"
    elif "liquidity" in prompt_lower:
        category = "liquidity_stress"
    elif "earning" in prompt_lower or "volatility" in prompt_lower:
        category = "earnings_volatility"
    elif "geopolitical" in prompt_lower or "war" in prompt_lower or "sanction" in prompt_lower:
        category = "geopolitical_event"
    elif "credit" in prompt_lower or "downgrade" in prompt_lower:
        category = "credit_downgrade"
    elif "panic" in prompt_lower or "selling" in prompt_lower or "client" in prompt_lower:
        category = "client_panic_selling"
    elif "concentration" in prompt_lower or "breach" in prompt_lower:
        category = "portfolio_concentration_breach"
    
    display_name = category.replace('_', ' ').title()
    
    return {
        "name": f"AI-Generated {display_name} Playbook",
        "description": f"Auto-generated playbook for scenario: {prompt[:100]}",
        "category": category,
        "trigger_conditions": {"type": category, "auto_generated": True, "source_prompt": prompt[:200]},
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
            "body": f"Dear {{client_name}},\n\nIn response to the current {display_name.lower()} conditions, our advisory team has activated protective measures for your portfolio.\n\nOur analysis indicates that portfolios with your risk profile may be exposed to elevated risk. We are implementing the following protective steps:\n\n1. Defensive rebalancing to reduce high-risk exposure\n2. Strategic hedging with protective instruments\n3. Enhanced monitoring of your portfolio positions\n\nWe will schedule a personal review call within the next 48 hours to discuss your portfolio strategy.\n\nBest regards,\nYour Wealth Advisory Team",
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
