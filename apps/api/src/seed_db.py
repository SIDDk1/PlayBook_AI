import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

# CRITICAL: Import ALL models before Base.metadata.create_all() to ensure
# SQLAlchemy's mapper registry has resolved all relationships.
from models import (
    Base, Permission, Role, User, role_permissions,
    Client, Portfolio, Scenario, Playbook,
    Workflow, Approval, Communication,
    AuditLog, Notification, Analytics,
)
from config.database import SessionLocal, engine
from config.security import get_password_hash


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # ── 1. Seed Roles ──────────────────────────────────────────────────
        print("Seeding roles...")
        roles_data = [
            {"name": "RelationshipManager", "description": "Client-facing Relationship Manager"},
            {"name": "RiskOfficer", "description": "Evaluates scenario impacts and concentration limits"},
            {"name": "ComplianceHead", "description": "Validates regulatory bounds and gives final execution clearance"},
        ]
        for r in roles_data:
            if not db.query(Role).filter(Role.name == r["name"]).first():
                db.add(Role(**r))
        db.commit()

        # ── 2. Seed Demo Users ─────────────────────────────────────────────
        print("Seeding demo users...")
        demo_users = [
            {"email": "rm@sentinel.ai", "password": "Sentinel2026!", "role_name": "RelationshipManager"},
            {"email": "risk@sentinel.ai", "password": "Sentinel2026!", "role_name": "RiskOfficer"},
            {"email": "compliance@sentinel.ai", "password": "Sentinel2026!", "role_name": "ComplianceHead"},
        ]
        for u_data in demo_users:
            if not db.query(User).filter(User.email == u_data["email"]).first():
                role = db.query(Role).filter(Role.name == u_data["role_name"]).first()
                user = User(
                    email=u_data["email"],
                    hashed_password=get_password_hash(u_data["password"]),
                    role_id=role.id if role else None,
                    is_active=True,
                )
                db.add(user)
        db.commit()

        # ── 3. Seed Playbooks ──────────────────────────────────────────────
        print("Seeding playbooks...")
        playbooks_data = [
            {
                "name": "Equity Market Crash Playbook",
                "description": "Defensive reallocation rules for sudden index declines (>10%) and VIX spikes (>35).",
                "category": "market_crash",
                "trigger_conditions": {"type": "market_crash", "index_drop_threshold": -0.10, "vix_threshold": 35},
                "actions": [
                    {"step": 1, "action_type": "rebalance", "params": {"sell": "Tech Equity", "buy": "US Treasuries", "amount_pct": 0.20}},
                    {"step": 2, "action_type": "hedge", "params": {"instrument": "Put Options on SPY", "coverage_pct": 0.15}},
                    {"step": 3, "action_type": "notify_client", "params": {"template": "capital_protection"}}
                ],
                "compliance_rules": {"requires_escalation": True, "restricted_asset_classes": ["Cryptocurrency"]},
                "impacted_portfolios_clients": {
                    "risk_profiles": ["Aggressive", "Moderate"],
                    "segments": ["HNW", "Ultra-HNW"],
                    "asset_classes": ["Equity"]
                },
                "risk_checks": [
                    {"check": "equity_exposure_limit", "threshold": 0.60, "action": "flag"},
                    {"check": "portfolio_var", "threshold": 0.15, "action": "escalate"}
                ],
                "client_communication_templates": {
                    "subject": "Portfolio Protection Update: Defensive Reallocation Active",
                    "body": "Dear {client_name},\n\nIn response to severe equity market volatility and our automated risk management triggers, we have activated the Capital Protection Reallocation protocol. Your portfolio exposure is being defensively rebalanced into safe-haven assets, including US Treasuries, and strategic hedging has been established.\n\nWe will schedule a review within the next 48 hours to discuss your personal requirements.\n\nBest regards,\nYour Wealth Advisory Team",
                    "tone": "Reassuring and professional"
                },
                "guardrails": {
                    "restricted_asset_classes": ["Cryptocurrency", "Leveraged ETFs"],
                    "max_single_trade_pct": 0.25,
                    "min_cash_buffer_pct": 0.05
                },
                "escalation_rules": {
                    "severity_threshold": "Critical",
                    "portfolio_value_threshold": 5000000,
                    "auto_escalate_roles": ["RiskOfficer", "ComplianceHead"]
                },
                "approval_workflow": ["RelationshipManager", "RiskOfficer", "ComplianceHead"],
                "post_action_review_metrics": [
                    {"metric": "portfolio_recovery_rate", "target": 0.85, "window_days": 30},
                    {"metric": "client_retention_rate", "target": 0.95, "window_days": 90}
                ]
            },
            {
                "name": "Technology Sector Correction Playbook",
                "description": "Triggered during a sharp drop in technology sectors to rotate into defensive or value assets.",
                "category": "sector_correction",
                "trigger_conditions": {"type": "sector_correction", "sector_drop_threshold": -0.08, "sector": "Technology"},
                "actions": [
                    {"step": 1, "action_type": "reduce_sector_weight", "params": {"sector": "Technology", "target_weight": 0.25}},
                    {"step": 2, "action_type": "diversify", "params": {"into_sectors": ["Healthcare", "Consumer Staples", "Utilities"]}}
                ],
                "compliance_rules": {"requires_escalation": False, "restricted_asset_classes": []},
                "impacted_portfolios_clients": {
                    "risk_profiles": ["Aggressive"],
                    "segments": ["HNW", "Ultra-HNW"],
                    "asset_classes": ["Equity"],
                    "sectors": ["Technology", "Semiconductors"]
                },
                "risk_checks": [
                    {"check": "sector_concentration", "threshold": 0.35, "action": "rebalance"},
                    {"check": "single_stock_exposure", "threshold": 0.15, "action": "flag"}
                ],
                "client_communication_templates": {
                    "subject": "Sector Rebalancing Notice: Technology Exposure Adjustment",
                    "body": "Dear {client_name},\n\nWe are executing a strategic sector rotation out of high-beta technology holdings into defensive value sectors (Healthcare, Staples, and Utilities) to insulate your portfolio from current sector-specific correction volatility.\n\nBest regards,\nYour Wealth Advisory Team",
                    "tone": "Informative"
                },
                "guardrails": {
                    "max_sector_weight": 0.30,
                    "min_diversification_sectors": 3
                },
                "escalation_rules": {
                    "severity_threshold": "Warning",
                    "auto_escalate_roles": ["RiskOfficer"]
                },
                "approval_workflow": ["RelationshipManager", "RiskOfficer"],
                "post_action_review_metrics": [
                    {"metric": "sector_rebalance_accuracy", "target": 0.90, "window_days": 14}
                ]
            },
            {
                "name": "Interest Rate Change Playbook",
                "description": "Adjusts portfolio duration and exposure in response to significant rate changes.",
                "category": "interest_rate_change",
                "trigger_conditions": {"type": "interest_rate_change", "rate_hike_basis_points": 50},
                "actions": [
                    {"step": 1, "action_type": "duration_reduction", "params": {"sell": "Long-term Bonds", "buy": "Short-term Floating Rate Notes"}},
                    {"step": 2, "action_type": "advisor_action", "params": {"notes": "Review corporate debt exposure and credit quality"}}
                ],
                "compliance_rules": {"requires_escalation": False, "restricted_asset_classes": []},
                "impacted_portfolios_clients": {
                    "risk_profiles": ["Conservative", "Moderate"],
                    "segments": ["Retail", "HNW", "Ultra-HNW"],
                    "asset_classes": ["Fixed Income", "Real Estate"]
                },
                "risk_checks": [
                    {"check": "duration_exposure", "threshold": 7.0, "action": "reduce"},
                    {"check": "fixed_vs_floating_ratio", "threshold": 0.70, "action": "rebalance"}
                ],
                "client_communication_templates": {
                    "subject": "Interest Rate Strategy Update: Adjusting Duration Exposure",
                    "body": "Dear {client_name},\n\nFollowing the recent central bank interest rate decision, we are adjusting the fixed-income portion of your portfolio. We are shortening bond duration and increasing allocations to floating-rate debt to protect capital against interest rate risk.\n\nBest regards,\nYour Wealth Advisory Team",
                    "tone": "Educational"
                },
                "guardrails": {
                    "max_duration_years": 5.0,
                    "restricted_asset_classes": []
                },
                "escalation_rules": {
                    "severity_threshold": "Warning",
                    "auto_escalate_roles": ["RiskOfficer"]
                },
                "approval_workflow": ["RelationshipManager", "RiskOfficer"],
                "post_action_review_metrics": [
                    {"metric": "duration_reduction_achieved", "target": 0.80, "window_days": 7}
                ]
            },
            {
                "name": "Liquidity Stress Playbook",
                "description": "Manages risk limits for private equity and small-cap assets during system liquidity constraints.",
                "category": "liquidity_stress",
                "trigger_conditions": {"type": "liquidity_stress", "bid_ask_threshold": 5.0, "volume_drop_pct": -0.50},
                "actions": [
                    {"step": 1, "action_type": "reduce_illiquid_positions", "params": {"target_liquid_pct": 0.25}},
                    {"step": 2, "action_type": "increase_cash_buffer", "params": {"buffer_pct": 0.10}},
                    {"step": 3, "action_type": "notify_client", "params": {"template": "liquidity_advisory"}}
                ],
                "compliance_rules": {"requires_escalation": True, "restricted_asset_classes": ["Private Equity", "Venture Capital"]},
                "impacted_portfolios_clients": {
                    "risk_profiles": ["Aggressive", "Moderate"],
                    "segments": ["Institutional", "Ultra-HNW"],
                    "asset_classes": ["Private Equity", "Venture Capital", "Small Cap Equity"]
                },
                "risk_checks": [
                    {"check": "illiquid_asset_ratio", "threshold": 0.30, "action": "reduce"},
                    {"check": "cash_buffer", "threshold": 0.10, "action": "increase"}
                ],
                "client_communication_templates": {
                    "subject": "Liquidity Management Advisory: Enhancing Cash Reserves",
                    "body": "Dear {client_name},\n\nDue to transient liquidity stresses across capital markets, we are implementing liquidity preservation measures. This includes building our cash and near-cash buffer and deferring additions to illiquid private assets.\n\nBest regards,\nYour Wealth Advisory Team",
                    "tone": "Urgent and professional"
                },
                "guardrails": {
                    "restricted_asset_classes": ["Private Equity", "Venture Capital"],
                    "max_illiquid_ratio": 0.25
                },
                "escalation_rules": {
                    "severity_threshold": "Critical",
                    "auto_escalate_roles": ["RiskOfficer", "ComplianceHead"]
                },
                "approval_workflow": ["RelationshipManager", "RiskOfficer", "ComplianceHead"],
                "post_action_review_metrics": [
                    {"metric": "liquidity_ratio_improvement", "target": 0.20, "window_days": 14}
                ]
            },
            {
                "name": "Earnings Volatility Playbook",
                "description": "Addresses high stock-specific volatility surrounding corporate reporting seasons.",
                "category": "earnings_volatility",
                "trigger_conditions": {"type": "earnings_volatility", "implied_vol_threshold": 40, "earnings_surprise_pct": -0.15},
                "actions": [
                    {"step": 1, "action_type": "hedge_volatility", "params": {"instrument": "Straddle Options", "coverage_pct": 0.10}},
                    {"step": 2, "action_type": "reduce_concentrated_positions", "params": {"max_single_stock": 0.10}}
                ],
                "compliance_rules": {"requires_escalation": False, "restricted_asset_classes": []},
                "impacted_portfolios_clients": {
                    "risk_profiles": ["Aggressive", "Moderate"],
                    "segments": ["HNW", "Ultra-HNW"],
                    "asset_classes": ["Equity"]
                },
                "risk_checks": [
                    {"check": "earnings_exposure", "threshold": 0.20, "action": "hedge"},
                    {"check": "options_coverage", "threshold": 0.10, "action": "increase"}
                ],
                "client_communication_templates": {
                    "subject": "Earnings Season Strategy Update: Managing Stock Volatility",
                    "body": "Dear {client_name},\n\nTo prepare your portfolio for high corporate earnings volatility, we are establishing selective option collars on key single-stock positions and pruning tactical equity concentrations.\n\nBest regards,\nYour Wealth Advisory Team",
                    "tone": "Analytical"
                },
                "guardrails": {
                    "max_single_stock_pct": 0.12,
                    "options_collar_required": True
                },
                "escalation_rules": {
                    "severity_threshold": "Warning",
                    "auto_escalate_roles": ["RiskOfficer"]
                },
                "approval_workflow": ["RelationshipManager", "RiskOfficer"],
                "post_action_review_metrics": [
                    {"metric": "volatility_hedge_effectiveness", "target": 0.75, "window_days": 21}
                ]
            },
            {
                "name": "Geopolitical Event Playbook",
                "description": "Reallocates portfolio capital into safe-havens during armed conflicts or trade sanctions.",
                "category": "geopolitical_event",
                "trigger_conditions": {"type": "geopolitical_event", "event_type": "armed_conflict_or_sanctions"},
                "actions": [
                    {"step": 1, "action_type": "safe_haven_reallocation", "params": {"buy": "Gold, US Treasuries, Swiss Franc", "sell": "Emerging Market Equity"}},
                    {"step": 2, "action_type": "fx_hedge", "params": {"instruments": ["FX Forwards", "Currency Options"]}},
                    {"step": 3, "action_type": "notify_client", "params": {"template": "geopolitical_advisory"}}
                ],
                "compliance_rules": {"requires_escalation": True, "restricted_asset_classes": []},
                "impacted_portfolios_clients": {
                    "risk_profiles": ["Aggressive", "Moderate", "Conservative"],
                    "segments": ["HNW", "Ultra-HNW", "Institutional"],
                    "asset_classes": ["Equity", "Commodities", "FX"]
                },
                "risk_checks": [
                    {"check": "geographic_exposure", "threshold": 0.20, "action": "reduce"},
                    {"check": "currency_risk", "threshold": 0.15, "action": "hedge"}
                ],
                "client_communication_templates": {
                    "subject": "Geopolitical Risk: Portfolio Protection Measures",
                    "body": "Dear {client_name},\n\nGiven the escalation of global geopolitical tensions, we are shifting portfolio weights to increase safe-haven assets (Gold, US sovereign bonds) and hedging foreign exchange risk to insulate your capital from global supply chain disruptions.\n\nBest regards,\nYour Wealth Advisory Team",
                    "tone": "Calm and authoritative"
                },
                "guardrails": {
                    "max_em_exposure_pct": 0.15,
                    "required_safe_haven_pct": 0.20
                },
                "escalation_rules": {
                    "severity_threshold": "Critical",
                    "auto_escalate_roles": ["RiskOfficer", "ComplianceHead"]
                },
                "approval_workflow": ["RelationshipManager", "RiskOfficer", "ComplianceHead"],
                "post_action_review_metrics": [
                    {"metric": "safe_haven_allocation_achieved", "target": 0.90, "window_days": 7}
                ]
            },
            {
                "name": "Credit Downgrade Playbook",
                "description": "Responds dynamically to major corporate or sovereign credit rating downgrades.",
                "category": "credit_downgrade",
                "trigger_conditions": {"type": "credit_downgrade", "rating_change": "Investment Grade to High Yield", "spread_widening_bps": 100},
                "actions": [
                    {"step": 1, "action_type": "credit_quality_upgrade", "params": {"sell": "BBB- and below bonds", "buy": "AAA/AA rated government bonds"}},
                    {"step": 2, "action_type": "spread_monitoring", "params": {"alert_threshold_bps": 150}}
                ],
                "compliance_rules": {"requires_escalation": False, "restricted_asset_classes": []},
                "impacted_portfolios_clients": {
                    "risk_profiles": ["Conservative", "Moderate"],
                    "segments": ["HNW", "Ultra-HNW"],
                    "asset_classes": ["Fixed Income", "Corporate Bonds"]
                },
                "risk_checks": [
                    {"check": "high_yield_exposure", "threshold": 0.15, "action": "reduce"},
                    {"check": "credit_quality_score", "threshold": 3.0, "action": "upgrade"}
                ],
                "client_communication_templates": {
                    "subject": "Credit Quality Adjustment Notice: Reallocating Corporate Fixed Income",
                    "body": "Dear {client_name},\n\nFollowing credit downgrades in major corporate sectors, we are adjusting the credit quality of your fixed-income portfolio by divesting from lower investment-grade names and reallocating into AAA/AA sovereign issues.\n\nBest regards,\nYour Wealth Advisory Team",
                    "tone": "Professional and decisive"
                },
                "guardrails": {
                    "min_avg_credit_rating": "BBB+",
                    "max_high_yield_pct": 0.10
                },
                "escalation_rules": {
                    "severity_threshold": "Warning",
                    "auto_escalate_roles": ["RiskOfficer"]
                },
                "approval_workflow": ["RelationshipManager", "RiskOfficer"],
                "post_action_review_metrics": [
                    {"metric": "portfolio_credit_quality_improvement", "target": 0.85, "window_days": 30}
                ]
            },
            {
                "name": "Client Panic-Selling Behavior Playbook",
                "description": "Advises relationship managers on stabilizing client portfolios and sentiment during redemptions.",
                "category": "client_panic_selling",
                "trigger_conditions": {"type": "client_panic_selling", "redemption_spike_pct": 0.30, "sentiment": "Very Negative"},
                "actions": [
                    {"step": 1, "action_type": "client_outreach", "params": {"method": "Personal call from RM", "talking_points": ["Market cycles are normal", "Historical recovery data", "Current portfolio protection measures"]}},
                    {"step": 2, "action_type": "protective_rebalance", "params": {"increase": "Cash and Short-term Bonds", "decrease": "Volatile Equity positions", "max_change_pct": 0.10}},
                    {"step": 3, "action_type": "schedule_review", "params": {"within_days": 5}}
                ],
                "compliance_rules": {"requires_escalation": False, "restricted_asset_classes": []},
                "impacted_portfolios_clients": {
                    "risk_profiles": ["Conservative", "Moderate"],
                    "segments": ["Retail", "HNW"],
                    "asset_classes": ["Equity", "Fixed Income", "Cash"]
                },
                "risk_checks": [
                    {"check": "redemption_queue", "threshold": 0.20, "action": "throttle"},
                    {"check": "cash_reserves", "threshold": 0.15, "action": "increase"}
                ],
                "client_communication_templates": {
                    "subject": "Your Portfolio: Navigating Market Uncertainty Together",
                    "body": "Dear {client_name},\n\nWe recognize the current market environment creates high levels of anxiety. We have activated our empathetic capital support protocol, adjusting short-term cash weights to insulate your immediate requirements while ensuring we stay aligned with long-term recovery metrics.\n\nBest regards,\nYour Relationship Manager",
                    "tone": "Empathetic and supportive"
                },
                "guardrails": {
                    "max_daily_redemption_pct": 0.05,
                    "cool_off_period_hours": 24,
                    "require_rm_call": True
                },
                "escalation_rules": {
                    "severity_threshold": "Warning",
                    "client_aum_threshold": 1000000,
                    "auto_escalate_roles": ["RiskOfficer"]
                },
                "approval_workflow": ["RelationshipManager", "RiskOfficer"],
                "post_action_review_metrics": [
                    {"metric": "client_retention_rate", "target": 0.95, "window_days": 90},
                    {"metric": "redemption_reversal_rate", "target": 0.60, "window_days": 30}
                ]
            },
            {
                "name": "Portfolio Concentration Breach Playbook",
                "description": "Triggered when a portfolio exceeds concentration limits in a single stock or sector.",
                "category": "portfolio_concentration_breach",
                "trigger_conditions": {"type": "portfolio_concentration_breach", "concentration_limit_pct": 0.35, "sector": "Technology"},
                "actions": [
                    {"step": 1, "action_type": "rebalance", "params": {"sell": "Over-concentrated sector positions", "buy": "Healthcare, Consumer Defensive, Industrials"}},
                    {"step": 2, "action_type": "set_alerts", "params": {"concentration_alert_pct": 0.30}}
                ],
                "compliance_rules": {"requires_escalation": True, "restricted_asset_classes": []},
                "impacted_portfolios_clients": {
                    "risk_profiles": ["Aggressive", "Moderate"],
                    "segments": ["Retail", "HNW", "Ultra-HNW"],
                    "asset_classes": ["Equity"]
                },
                "risk_checks": [
                    {"check": "sector_concentration", "threshold": 0.35, "action": "rebalance"},
                    {"check": "single_name_risk", "threshold": 0.10, "action": "diversify"}
                ],
                "client_communication_templates": {
                    "subject": "Portfolio Rebalancing: Concentration Limit Maintenance",
                    "body": "Dear {client_name},\n\nTo ensure your portfolio adheres to risk and regulatory limits, we have scheduled a routine rebalancing of your holdings to address our sector concentration bounds. We are trimming technology positions and spreading the capital into healthcare and consumer defensive leaders.\n\nBest regards,\nYour Wealth Advisory Team",
                    "tone": "Professional"
                },
                "guardrails": {
                    "max_sector_pct": 0.30,
                    "max_single_stock_pct": 0.08,
                    "requires_escalation": True
                },
                "escalation_rules": {
                    "severity_threshold": "Warning",
                    "auto_escalate_roles": ["RiskOfficer"]
                },
                "approval_workflow": ["RelationshipManager", "RiskOfficer"],
                "post_action_review_metrics": [
                    {"metric": "concentration_reduction_achieved", "target": 0.90, "window_days": 14}
                ]
            }
        ]
        for p in playbooks_data:
            if not db.query(Playbook).filter(Playbook.name == p["name"]).first():
                db.add(Playbook(**p))
        db.commit()

        # ── 4. Seed Clients & Portfolios ───────────────────────────────────
        print("Seeding clients and portfolios...")
        clients_data = [
            {
                "name": "Siddharth Kaushik",
                "email": "skaushik@walkingtree.tech",
                "risk_profile": "Aggressive",
                "segment": "HNW",
                "portfolio": {
                    "name": "Kaushik Aggressive Growth",
                    "assets": [
                        {"ticker": "AAPL", "weight": 0.40, "asset_class": "Equity", "value": 400000.0},
                        {"ticker": "NVDA", "weight": 0.20, "asset_class": "Equity", "value": 200000.0},
                        {"ticker": "SHV", "weight": 0.40, "asset_class": "Fixed Income", "value": 400000.0},
                    ],
                    "total_value": 1000000.0,
                    "risk_score": 7.8,
                },
            },
            {
                "name": "Priya Mehta",
                "email": "pmehta@alphawealth.com",
                "risk_profile": "Moderate",
                "segment": "Ultra-HNW",
                "portfolio": {
                    "name": "Mehta Balanced Growth",
                    "assets": [
                        {"ticker": "SPY", "weight": 0.30, "asset_class": "Equity", "value": 1500000.0},
                        {"ticker": "TLT", "weight": 0.35, "asset_class": "Fixed Income", "value": 1750000.0},
                        {"ticker": "GLD", "weight": 0.15, "asset_class": "Alternatives", "value": 750000.0},
                        {"ticker": "CASH", "weight": 0.20, "asset_class": "Cash", "value": 1000000.0},
                    ],
                    "total_value": 5000000.0,
                    "risk_score": 5.2,
                },
            },
            {
                "name": "Rajesh Gupta",
                "email": "rgupta@institutionalcap.com",
                "risk_profile": "Conservative",
                "segment": "Institutional",
                "portfolio": {
                    "name": "Gupta Capital Preservation",
                    "assets": [
                        {"ticker": "AGG", "weight": 0.60, "asset_class": "Fixed Income", "value": 6000000.0},
                        {"ticker": "BRK.B", "weight": 0.25, "asset_class": "Equity", "value": 2500000.0},
                        {"ticker": "CASH", "weight": 0.15, "asset_class": "Cash", "value": 1500000.0},
                    ],
                    "total_value": 10000000.0,
                    "risk_score": 3.1,
                },
            },
        ]
        for c_data in clients_data:
            portfolio_data = c_data.pop("portfolio")
            client = db.query(Client).filter(Client.email == c_data["email"]).first()
            if not client:
                client = Client(**c_data)
                db.add(client)
                db.commit()
                db.refresh(client)
            if not db.query(Portfolio).filter(Portfolio.client_id == client.id).first():
                portfolio = Portfolio(client_id=client.id, **portfolio_data)
                db.add(portfolio)
        db.commit()

        # ── 5. Seed a demo scenario ────────────────────────────────────────
        print("Seeding demo scenario...")
        if db.query(Scenario).count() == 0:
            scenario = Scenario(
                type="portfolio_concentration_breach",
                severity="Warning",
                market_data={"sector": "Technology", "breach_pct": 60, "limit_pct": 35},
                status="Active",
            )
            db.add(scenario)
            db.commit()

        print("\nDatabase seeded successfully!")
        print("--------------------------------------")
        print("Demo accounts created:")
        print("  rm@sentinel.ai         -> RelationshipManager")
        print("  risk@sentinel.ai       -> RiskOfficer")
        print("  compliance@sentinel.ai -> ComplianceHead")
        print("  Password: Sentinel2026!")
        print("--------------------------------------")

    except Exception as e:
        db.rollback()
        print(f"ERROR seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
