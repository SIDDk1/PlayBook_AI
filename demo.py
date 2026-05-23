#!/usr/bin/env python3
"""
Sentinel AI - Interactive Live Demo Controller
Presents a simple CLI menu to trigger events, check pending approvals, 
push sequential workflows, and generate playbooks dynamically.
"""

import sys
import os
import requests
import json
import time

BASE = "http://127.0.0.1:8000/api/v1"
PASS = "Sentinel2026!"

# Terminal formatting colors
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Handle Windows terminal compatibility
if os.name == "nt":
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except Exception:
        GREEN = YELLOW = RED = BLUE = BOLD = RESET = ""

def print_header(title):
    print(f"\n{BLUE}{BOLD}{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}{RESET}")

def get_auth_token(username):
    try:
        r = requests.post(f"{BASE}/auth/login", data={"username": username, "password": PASS}, timeout=5)
        if r.status_code == 200:
            return r.json()["access_token"]
        else:
            print(f"{RED}Login failed: {r.status_code} {r.text}{RESET}")
            return None
    except Exception as e:
        print(f"{RED}Error connecting to backend: {e}{RESET}")
        return None

def trigger_market_scenario():
    print_header("TRIGGER LIVE MARKET SCENARIO")
    print(f"Logging in as {BOLD}risk@sentinel.ai{RESET}...")
    token = get_auth_token("risk@sentinel.ai")
    if not token:
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "type": "market_crash",
        "severity": "Critical",
        "market_data": {"index_drop": -0.15, "vix": 45, "sp500_change": -15.4},
        "status": "Active"
    }
    
    print(f"Sending scenario payload to {BASE}/scenarios/...")
    try:
        r = requests.post(f"{BASE}/scenarios/", json=payload, headers=headers, timeout=5)
        if r.status_code == 201:
            data = r.json()
            print(f"{GREEN}{BOLD}✓ SCENARIO TRIGGERED SUCCESSFULLY!{RESET}")
            print(f"  Scenario ID: #{data.get('id')}")
            print(f"  Event Type:  {data.get('type')} ({data.get('severity')})")
            print(f"  Status:      {data.get('status')}")
            print(f"\n{YELLOW}Wait! The 6-Agent AI Orchestrator has now automatically stress-tested{RESET}")
            print(f"{YELLOW}all client portfolios and prepared the RM approval workflows!{RESET}")
        else:
            print(f"{RED}Trigger failed: {r.status_code} {r.text}{RESET}")
    except Exception as e:
        print(f"{RED}Error triggering scenario: {e}{RESET}")

def check_pending_approvals():
    print_header("PENDING APPROVAL WORKFLOWS")
    print(f"Logging in as {BOLD}risk@sentinel.ai{RESET} (Risk Officer)...")
    token = get_auth_token("risk@sentinel.ai")
    if not token:
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    try:
        r = requests.get(f"{BASE}/approvals/pending", headers=headers, timeout=5)
        if r.status_code == 200:
            approvals = r.json()
            print(f"\nFound {BOLD}{len(approvals)}{RESET} pending approvals in Risk Officer queue:\n")
            for app in approvals:
                wid = app.get("id")
                role = app.get("role_name", "RiskOfficer")
                status = app.get("status")
                sc_id = app.get("workflow", {}).get("scenario_id", "N/A")
                sc_type = app.get("workflow", {}).get("scenario", {}).get("type", "N/A")
                print(f"  - [{wid}] Scenario #{sc_id} ({sc_type:15s}) | Role: {role:12s} | Status: {status}")
        else:
            print(f"{RED}Failed fetching approvals: {r.status_code}{RESET}")
    except Exception as e:
        print(f"{RED}Error checking approvals: {e}{RESET}")

def approve_workflow():
    print_header("STATEFUL WORKFLOW APPROVAL")
    print(f"Logging in as {BOLD}risk@sentinel.ai{RESET} (Risk Officer)...")
    token = get_auth_token("risk@sentinel.ai")
    if not token:
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    try:
        # 1. Fetch pending
        r = requests.get(f"{BASE}/approvals/pending", headers=headers, timeout=5)
        approvals = r.json() if r.status_code == 200 else []
        
        if not approvals:
            print(f"{YELLOW}No pending approvals found in Risk Officer queue.{RESET}")
            print("Try triggering a scenario first (Option 1).")
            return
            
        target = approvals[0]
        app_id = target["id"]
        
        print(f"\nFound active Pending Approval #{app_id}.")
        comments = input(f"Enter approval comment [{GREEN}Looks good, approve rebalance{RESET}]: ")
        if not comments.strip():
            comments = "Looks good, approve rebalance"
            
        # 2. Approve
        action_payload = {"action": "Approved", "comments": comments}
        print(f"Submitting approval to {BASE}/approvals/{app_id}/action...")
        r_act = requests.post(f"{BASE}/approvals/{app_id}/action", json=action_payload, headers=headers, timeout=5)
        
        if r_act.status_code == 200:
            print(f"{GREEN}{BOLD}✓ WORKFLOW STEP APPROVED SUCCESSFUL!{RESET}")
            print(f"  Approval State: {r_act.json().get('status')}")
            print(f"\n{YELLOW}The workflow is now statefully escalated to the Compliance Head!{RESET}")
        else:
            print(f"{RED}Approval failed: {r_act.status_code} {r_act.text}{RESET}")
            
    except Exception as e:
        print(f"{RED}Error executing approval: {e}{RESET}")

def test_ai_generator():
    print_header("TEST GENERATIVE PLAYBOOK STUDIO")
    print(f"Logging in as {BOLD}risk@sentinel.ai{RESET}...")
    token = get_auth_token("risk@sentinel.ai")
    if not token:
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    prompt = input(f"Enter custom scenario prompt [{GREEN}Inflation spikes, impacting bonds{RESET}]: ")
    if not prompt.strip():
        prompt = "Inflation spikes, forcing interest rates up and impacting long-duration bonds"
        
    print(f"\nQuerying AI Playbook Generator API...")
    try:
        r = requests.post(f"{BASE}/playbooks/generate", json={"prompt": prompt}, headers=headers, timeout=10)
        if r.status_code == 200:
            data = r.json()
            print(f"{GREEN}{BOLD}✓ AI PLAYBOOK ARCHITECTED!{RESET}")
            print(f"  Playbook Name: {BOLD}{data.get('name')}{RESET}")
            print(f"  Category:      {data.get('category')}")
            print(f"  Risk Checks:   {len(data.get('risk_checks', []))} audits configured")
            print(f"  Actions:       {len(data.get('actions', []))} advisor steps")
            print(f"  Comms Tone:    {data.get('client_communication_templates', {}).get('tone')}")
            print(f"  Workflow:      {data.get('approval_workflow')}")
        else:
            print(f"{RED}Generation failed: {r.status_code} {r.text}{RESET}")
    except Exception as e:
        print(f"{RED}Error generating playbook: {e}{RESET}")

def reset_database():
    print_header("RESET & SEED DATABASE")
    confirm = input(f"{RED}{BOLD}WARNING: This will drop all tables and reload clean seeded values.{RESET} Proceed? (y/n): ")
    if confirm.lower() != 'y':
        print("Cancelled.")
        return
        
    print("Resetting database...")
    try:
        # Run standard python calls to reset tables
        cmd_drop = "python -c \"from config.database import engine; from models import Base; Base.metadata.drop_all(bind=engine); print('Tables dropped.')\""
        os.system(f"cd apps\\api\\src && {cmd_drop}")
        os.system("cd apps\\api\\src && python seed_db.py")
        print(f"{GREEN}{BOLD}✓ DATABASE RESET AND RE-SEEDED SUCCESSFULLY!{RESET}")
    except Exception as e:
        print(f"{RED}Failed resetting: {e}{RESET}")

def main_menu():
    while True:
        print(f"\n{BLUE}{BOLD}============================================================{RESET}")
        print(f"   {GREEN}{BOLD}🛡️  Sentinel AI Wealth Playbook - Demo Control Panel  🛡️{RESET}")
        print(f"{BLUE}{BOLD}============================================================{RESET}")
        print("  1. Trigger Live Market Scenario (Simulate Crash)")
        print("  2. Check Pending Workflow Approvals (Risk Queue)")
        print("  3. Stateful Workflow Approval (Approve & Escalate)")
        print("  4. Test Generative Playbook Studio (Prompt AI)")
        print("  5. Reset & Re-Seed Database (Restore Starting State)")
        print("  0. Exit")
        print(f"{BLUE}{BOLD}------------------------------------------------------------{RESET}")
        
        choice = input("Select an option: ")
        if choice == '1':
            trigger_market_scenario()
        elif choice == '2':
            check_pending_approvals()
        elif choice == '3':
            approve_workflow()
        elif choice == '4':
            test_ai_generator()
        elif choice == '5':
            reset_database()
        elif choice == '0':
            print("\nExiting. Happy Hackathon Coding!")
            break
        else:
            print(f"{RED}Invalid choice. Select 0-5.{RESET}")
        
        input(f"\nPress {BOLD}[Enter]{RESET} to return to the menu...")

if __name__ == "__main__":
    main_menu()
