# 📖 Sentinel AI — Production Integration Tutorial Guide

This guide provides a detailed, step-by-step roadmap to transition **Sentinel AI** from a high-fidelity hackathon prototype to a fully live, enterprise-ready wealth management responder. It explains how to plug in real **OpenAI API keys** and connect **live production data feeds** (Market APIs, Custodian holdings, FIX trading desks, and CRM mail servers).

---

## 📂 Table of Contents
1. [🔑 Step 1: Activating Live OpenAI Generative AI (10 Seconds)](#-step-1-activating-live-openai-generative-ai-10-seconds)
2. [🗄️ Step 2: Migrating to PostgreSQL & Syncing Real Portfolio Data](#%EF%B8%8F-step-2-migrating-to-postgresql--syncing-real-portfolio-data)
3. [📈 Step 3: Connecting Live Market Data Feeds (Automated Triggers)](#-step-3-connecting-live-market-data-feeds-automated-triggers)
4. [💼 Step 4: Automating Trade Rebalancing (Execution APIs / FIX Protocol)](#-step-4-automating-trade-rebalancing-execution-apis--fix-protocol)
5. [✉️ Step 5: Dispatching Real Client Emails & Updating CRMs](#%EF%B8%8F-step-5-dispatching-real-client-emails--updating-crms)

---

## 🔑 Step 1: Activating Live OpenAI Generative AI (10 Seconds)

Sentinel AI is **100% pre-wired** to support real OpenAI generative AI. By default, it runs on an intelligent local mock fallback if no API key is specified, ensuring the interface never crashes.

### How to Activate Live OpenAI:
1.  Open the local environment configuration file at `apps/api/.env` (or create it by copying `apps/api/.env.example`).
2.  Locate the `OPENAI_API_KEY` parameter and paste your actual OpenAI API Key:
    ```ini
    # apps/api/.env
    OPENAI_API_KEY="sk-proj-YourActualOpenAiApiKeyHere..."
    ```
3.  Save the file.
4.  **That's it!** The FastAPI server automatically reloads. The `llm_service.py` detects the key and immediately routes all Playbook Generation and Multi-Agent traces directly through the live **OpenAI API** (`gpt-4o-mini`).

---

## 🗄️ Step 2: Migrating to PostgreSQL & Syncing Real Portfolio Data

In production, client portfolios are synced overnight from institutional custodian systems instead of being read from the local SQLite database.

### 1. Database Migration
To switch from SQLite to an enterprise database like **PostgreSQL** or **Amazon RDS**, update your connection URL inside `apps/api/.env`:
```ini
# Switch database connection to your production PostgreSQL instance
DATABASE_URL="postgresql://db_user:db_password@production-rds-host:5432/sentinel_prod"
```
Because the backend is built using **SQLAlchemy ORM**, the schemas map automatically to PostgreSQL without rewriting a single SQL query.

### 2. Syncing Custodian Positions (ETL Pipeline)
To ingest real client holdings from custody systems (**Charles Schwab**, **Fidelity**, or aggregators like **Addepar** and **Plaid**), implement a nightly ETL (Extract, Transform, Load) background task:

```python
# Conceptual implementation: apps/api/src/tasks/custodian_sync.py
import httpx
from config.database import SessionLocal
from models.portfolio import Portfolio, Client

def sync_custodian_positions():
    db = SessionLocal()
    # 1. Fetch live client balances from wealth aggregator (e.g. Plaid/Addepar API)
    response = httpx.get(
        "https://api.addepar.com/v1/portfolios",
        headers={"Authorization": "Bearer ADDEPAR_API_TOKEN"}
    )
    external_data = response.json()
    
    for client_record in external_data["data"]:
        # 2. Map custodian fields to Sentinel AI database schema
        db_portfolio = db.query(Portfolio).filter(Portfolio.client_id == client_record["id"]).first()
        if db_portfolio:
            db_portfolio.total_value = client_record["market_value"]
            db_portfolio.asset_allocation = {
                "Equity": client_record["equity_pct"],
                "Fixed Income": client_record["fixed_income_pct"],
                "Cash": client_record["cash_pct"],
                "Alternatives": client_record["alternatives_pct"]
            }
    db.commit()
    db.close()
    print("Nightly custodian holdings sync completed successfully.")
```

---

## 📈 Step 3: Connecting Live Market Data Feeds (Automated Triggers)

Instead of having a Risk Officer manually push buttons to simulate a market scenario, you can trigger the platform automatically using real financial webhooks or APIs (**Alpha Vantage**, **Polygon.io**, or **Bloomberg API**).

### Automated Ingestion Script Example
Add a background scheduler using the pre-installed `Celery` task runner that polls the market index prices:

```python
# Conceptual implementation: apps/api/src/tasks/market_monitor.py
import httpx
from celery import Celery

app = Celery('tasks', broker='redis://localhost:6379/0')

@app.task
def monitor_market_indices():
    # 1. Query live market pricing (e.g. Polygon.io API)
    r = httpx.get("https://api.polygon.io/v2/aggs/ticker/I:SPX/prev?apiKey=POLYGON_API_KEY")
    market_data = r.json()
    daily_change_pct = market_data["results"][0]["c"] / market_data["results"][0]["o"] - 1.0
    
    # 2. If index declines past threshold, automatically trigger Sentinel AI Scenario
    if daily_change_pct <= -0.10: # 10% drop or more
        print("ALERT: Major Equity drawdown detected. Triggering Sentinel AI Multi-Agent Scenario...")
        httpx.post(
            "http://127.0.0.1:8000/api/v1/scenarios/",
            json={
                "type": "market_crash",
                "severity": "Critical",
                "market_data": {
                    "index_drop": daily_change_pct,
                    "sp500_change_pct": daily_change_pct * 100
                },
                "status": "Active"
            },
            headers={"Authorization": "Bearer ADMIN_SYSTEM_TOKEN"}
        )
```

---

## 💼 Step 4: Automating Trade Rebalancing (Execution APIs / FIX Protocol)

Currently, the recommended advisor actions (e.g., *Sell Tech, Buy Treasuries*) are shown as a checklist. To execute actual transactions in client accounts:

### FIX Protocol Routing
In an enterprise wealth management firm, trading is conducted via the **FIX (Financial Information eXchange) Protocol**.

1.  **Generate Orders**: Upon final sequential approval by the **Compliance Head**, the backend translates allocation rules into exact order tickets (shares to buy/sell).
2.  **Dispatch FIX message**: Route order requests via a FIX gateway (e.g. using the Python `quickfix` library) to the custodian’s execution desk.

```python
# Conceptual implementation: apps/api/src/services/trading_service.py
import quickfix as fix

def execute_rebalance_trades(client_id, ticker_to_sell, ticker_to_buy, amount_usd):
    # Construct standard FIX 4.4 Single Order Message
    message = fix.Message()
    header = message.getHeader()
    header.setField(fix.BeginString(fix.BeginString_FIX44))
    header.setField(fix.MsgType(fix.MsgType_NewOrderSingle))
    
    # Define trade parameters
    message.setField(fix.ClOrdID("SENTINEL_ORDER_" + str(client_id)))
    message.setField(fix.HandlInst(fix.HandlInst_AUTOMATED_EXECUTION_ORDER_PRIVATE_NO_BROKER_INTERVENTION))
    message.setField(fix.Symbol(ticker_to_buy))
    message.setField(fix.Side(fix.Side_BUY))
    message.setField(fix.TransactTime())
    message.setField(fix.OrdType(fix.OrdType_MARKET))
    
    # Send order to institutional execution desk
    fix.Session.sendToTarget(message, "SENDER_COMP_ID", "TARGET_COMP_ID")
    print(f"Dispatched trade order to buy {ticker_to_buy} worth ${amount_usd:,.2f} via FIX Gateway.")
```

---

## ✉️ Step 5: Dispatching Real Client Emails & Updating CRMs

Currently, personalized communication drafts are displayed as text on the UI dashboard. To dispatch them:

### 1. Sending Emails via SendGrid API
Configure your email notification service to trigger real emails to clients:

```python
# Conceptual implementation: apps/api/src/services/email_service.py
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_client_protection_email(client_email, client_name, email_subject, email_body):
    message = Mail(
        from_email='wealth-advisor@sentinel-wealth.ai',
        to_emails=client_email,
        subject=email_subject,
        html_content=email_body.replace("\n", "<br>")
    )
    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(f"Email successfully dispatched to {client_name} ({client_email}) via SendGrid.")
        return True
    except Exception as e:
        print(f"Failed to dispatch email: {e}")
        return False
```

### 2. Logging Activity in Salesforce Financial Services Cloud (CRM)
To ensure the firm maintains a complete audit trail, log all dispatched client notices directly under their Salesforce profile:

```python
# Ingest notification records into Salesforce CRM
def log_crm_activity(client_sf_id, subject, body):
    sf_api_url = "https://your-instance.my.salesforce.com/services/data/v58.0/sobjects/Task"
    headers = {
        "Authorization": "Bearer SF_SESSION_ID",
        "Content-Type": "application/json"
    }
    task_payload = {
        "Subject": "Sentinel AI Alert: " + subject,
        "Description": body,
        "Status": "Completed",
        "Priority": "Normal",
        "WhatId": client_sf_id # Link to Salesforce Client Record ID
    }
    httpx.post(sf_api_url, json=task_payload, headers=headers)
```
