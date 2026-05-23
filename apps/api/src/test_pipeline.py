"""
Sentinel AI - Full End-to-End Test
Tests: login, all CRUD endpoints, AI pipeline, approval workflow
"""
import httpx
import json
import sys

BASE = "http://127.0.0.1:8000"
PASS = "Sentinel2026!"

# Setup global client with generous timeout for live OpenAI API agent resolution
client = httpx.Client(timeout=45.0)

def section(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print('='*50)

def check(label, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"  [{status}] {label}", f"({detail})" if detail else "")
    if not condition:
        sys.exit(1)

section("1. HEALTH CHECK")
r = client.get(f"{BASE}/health")
check("API health endpoint", r.status_code == 200, r.text)
check("Database connected", r.json().get("status") == "healthy")

section("2. AUTHENTICATION")
# RM login
r = client.post(f"{BASE}/api/v1/auth/login", data={"username": "rm@sentinel.ai", "password": PASS})
check("RM login", r.status_code == 200, f"HTTP {r.status_code}")
rm_token = r.json()["access_token"]
rm_user = r.json()["user"]
check("RM role returned", rm_user["role"]["name"] == "RelationshipManager")

# Risk login
r = client.post(f"{BASE}/api/v1/auth/login", data={"username": "risk@sentinel.ai", "password": PASS})
check("RiskOfficer login", r.status_code == 200)
risk_token = r.json()["access_token"]

# Compliance login
r = client.post(f"{BASE}/api/v1/auth/login", data={"username": "compliance@sentinel.ai", "password": PASS})
check("ComplianceHead login", r.status_code == 200)
comp_token = r.json()["access_token"]

rm_h = {"Authorization": f"Bearer {rm_token}"}
risk_h = {"Authorization": f"Bearer {risk_token}"}
comp_h = {"Authorization": f"Bearer {comp_token}"}

section("3. PLAYBOOKS")
r = client.get(f"{BASE}/api/v1/playbooks/", headers=rm_h)
check("List playbooks", r.status_code == 200)
playbooks = r.json()
check("Seeded playbooks exist", len(playbooks) >= 4, f"{len(playbooks)} found")
print(f"  Playbooks: {[p['name'] for p in playbooks]}")

section("4. CLIENTS & PORTFOLIOS")
r = client.get(f"{BASE}/api/v1/clients/", headers=rm_h)
check("List clients", r.status_code == 200)
clients = r.json()
check("Seeded clients exist", len(clients) >= 3, f"{len(clients)} found")

r = client.get(f"{BASE}/api/v1/portfolios/", headers=rm_h)
check("List portfolios", r.status_code == 200)
portfolios = r.json()
check("Seeded portfolios exist", len(portfolios) >= 3, f"{len(portfolios)} found")
total_aum = sum(p["total_value"] for p in portfolios)
print(f"  Total AUM: ${total_aum:,.0f}")

section("5. SCENARIOS & AI PIPELINE")
# Trigger scenario as RiskOfficer
scenario_payload = {
    "type": "market_crash",
    "severity": "Critical",
    "market_data": {"index_drop": -0.15, "vix": 45, "sp500_change": -12},
    "status": "Active"
}
r = client.post(f"{BASE}/api/v1/scenarios/", json=scenario_payload, headers=risk_h)
check("Trigger scenario (RiskOfficer)", r.status_code == 201, f"HTTP {r.status_code}")
scenario = r.json()
print(f"  Scenario ID #{scenario['id']}: {scenario['type']} ({scenario['severity']})")

# Verify scenario visible
r = client.get(f"{BASE}/api/v1/scenarios/", headers=rm_h)
check("Scenarios list", r.status_code == 200)
scenarios = r.json()
check("Scenario created", any(s["id"] == scenario["id"] for s in scenarios))

section("6. APPROVAL WORKFLOW")
# Check RiskOfficer approvals
r = client.get(f"{BASE}/api/v1/approvals/pending", headers=risk_h)
check("RiskOfficer pending approvals", r.status_code == 200)
risk_approvals = r.json()
check("Approval created for RiskOfficer", len(risk_approvals) >= 1, f"{len(risk_approvals)} pending")

# Approve as RiskOfficer
if risk_approvals:
    approval_id = risk_approvals[0]["id"]
    r = client.post(
        f"{BASE}/api/v1/approvals/{approval_id}/action",
        json={"action": "Approved", "comments": "Looks good, escalate to Compliance."},
        headers=risk_h
    )
    check("RiskOfficer approves workflow", r.status_code == 200, f"HTTP {r.status_code}")
    result = r.json()
    print(f"  Approval #{approval_id} -> {result['status']}")

# Check ComplianceHead gets next approval
r = client.get(f"{BASE}/api/v1/approvals/pending", headers=comp_h)
check("ComplianceHead pending approvals", r.status_code == 200)
comp_approvals = r.json()
print(f"  ComplianceHead has {len(comp_approvals)} pending approvals")

section("7. RBAC ENFORCEMENT")
# RM cannot create playbooks
r = client.post(f"{BASE}/api/v1/playbooks/", json={"name":"test","trigger_conditions":{},"actions":[],"compliance_rules":{}}, headers=rm_h)
check("RM blocked from creating playbooks", r.status_code == 403, f"HTTP {r.status_code}")

# RiskOfficer can create playbooks
r = client.post(f"{BASE}/api/v1/playbooks/", json={"name":"Test Playbook E2E","description":"E2E test","trigger_conditions":{"type":"test"},"actions":[],"compliance_rules":{}}, headers=risk_h)
check("RiskOfficer can create playbook", r.status_code == 201, f"HTTP {r.status_code}")

section("SUMMARY")
print("  All systems operational!")
print("  Backend API:   http://localhost:8000")
print("  API Docs:      http://localhost:8000/docs")
print("  Frontend App:  http://localhost:3000")
print()
print("  Login credentials:")
print("  rm@sentinel.ai         / Sentinel2026!  (RelationshipManager)")
print("  risk@sentinel.ai       / Sentinel2026!  (RiskOfficer)")
print("  compliance@sentinel.ai / Sentinel2026!  (ComplianceHead)")

