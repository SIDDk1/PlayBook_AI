import httpx
import json
import time

url = "http://127.0.0.1:8000/api/v1/scenarios"

payload = {
    "title": "US Fed Rate Hike Shock",
    "scenario_type": "interest_rate_change",
    "description": "US Fed raises interest rates by 75bps unexpectedly, sparking selloff in yield-sensitive assets and tech stocks.",
    "client_ids": ["6a10d4e69fc065c94d9f6a8c"],
    "portfolio_ids": ["6a10d4e69fc065c94d9f6a8f"],
    "market_signals": [
        {
            "metric": "Fed Funds Rate Change",
            "value": "75bps",
            "direction": "up",
            "note": "Surprise hike"
        }
    ],
    "affected_sectors": ["Technology", "Real Estate"],
    "severity_hint": "moderate"
}

print("Posting scenario to trigger AI execution...")
print("If the model 'deepseek-r1:1.5b' is not present, the auto-pull mechanism will trigger.")
print("This may take a few minutes for the initial download. Please wait...")

start_time = time.time()
try:
    # Set a long timeout so it doesn't fail during the model pull
    response = httpx.post(url, json=payload, timeout=600.0)
    duration = time.time() - start_time
    print(f"\nResponse received in {duration:.2f} seconds!")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n=== AI Scenario Analysis Result ===")
        print(f"Detected Scenario: {data.get('detection', {}).get('scenario', 'Unknown')}")
        print(f"Matched Playbook: {data.get('playbook_match', {}).get('selected_playbook_name', 'None')}")
        
        analysis = data.get("analysis", {})
        print(f"AI Selected Playbook: {analysis.get('playbook')}")
        print(f"AI Actions count: {len(analysis.get('actions', []))}")
        for i, action in enumerate(analysis.get("actions", [])):
            print(f"  Action {i+1}: {action.get('title')} - {action.get('description')} ({action.get('priority')})")
            print(f"    Reason: {action.get('reason')}")
            
        print("\nExplanations:")
        for exp in analysis.get("explanations", []):
            print(f"  - {exp}")
            
        print(f"\nClient Message:\n{analysis.get('client_message')}")
        
        # Check if it was fallback
        is_fallback = any("fallback" in exp.lower() for exp in analysis.get("explanations", []))
        if is_fallback:
            print("\nWARNING: Deterministic fallback was used. Let's inspect logs.")
        else:
            print("\nSUCCESS: End-to-end AI execution completed successfully using deepseek-r1:1.5b!")
    else:
        print(f"Failed: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
