from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.database import get_db
from auth.deps import get_current_user, RoleChecker
from models.scenario import Scenario
from models.approval import Workflow, Approval
from models.communication import Communication
from schemas.scenario import ScenarioCreate, ScenarioUpdate, ScenarioResponse
from services.ai.agent_orchestrator import MultiAgentOrchestrator

router = APIRouter()

# Allow RelationshipManagers, RiskOfficers, and ComplianceHeads to read scenarios
read_roles = RoleChecker(["RelationshipManager", "RiskOfficer", "ComplianceHead"])
# RiskOfficers or RelationshipManagers can trigger scenarios
write_roles = RoleChecker(["RelationshipManager", "RiskOfficer"])

@router.post("/", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
def trigger_scenario(
    scenario_in: ScenarioCreate,
    db: Session = Depends(get_db),
    current_user = Depends(write_roles)
):
    # 1. Create and save the scenario telemetry
    scenario = Scenario(**scenario_in.dict())
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    
    # 2. Trigger the Multi-Agent Orchestrator Pipeline
    orchestrator = MultiAgentOrchestrator(db)
    pipeline_result = orchestrator.run_scenarios_pipeline(scenario)
    
    # 3. Identify matching playbook (if any matched via RAG)
    playbook_id = None
    matched_playbooks = pipeline_result.get("matched_playbooks", [])
    if matched_playbooks:
        # Link the top matched playbook
        playbook_id = matched_playbooks[0]["id"]

    # 4. Create the execution Workflow
    workflow = Workflow(
        scenario_id=scenario.id,
        playbook_id=playbook_id,
        status="Pending",
        context={
            "market_analysis": pipeline_result.get("market_analysis"),
            "risk_evaluation": pipeline_result.get("risk_evaluation"),
            "compliance_check": pipeline_result.get("compliance_check")
        }
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)

    # 5. Create Approval chain based on Escalation Agent output
    escalation_workflow = pipeline_result.get("escalation_workflow", ["RelationshipManager"])
    for role_name in escalation_workflow:
        approval_step = Approval(
            workflow_id=workflow.id,
            approver_role=role_name,
            status="Pending"
        )
        db.add(approval_step)
        
    # 6. Create Communication draft based on Communication Agent output
    comm_draft = pipeline_result.get("communication_drafts", {})
    communication = Communication(
        workflow_id=workflow.id,
        channel="Email",
        recipient="client@walkingtree.tech",  # Fallback recipient
        subject=comm_draft.get("subject", "Portfolio Advisory Alert"),
        content=comm_draft.get("body", "Advisory alert details."),
        status="Draft"
    )
    db.add(communication)
    
    db.commit()
    return scenario

@router.get("/", response_model=List[ScenarioResponse])
def list_scenarios(
    db: Session = Depends(get_db),
    current_user = Depends(read_roles)
):
    return db.query(Scenario).all()

@router.get("/{scenario_id}", response_model=ScenarioResponse)
def get_scenario(
    scenario_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(read_roles)
):
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found."
        )
    return scenario

@router.put("/{scenario_id}", response_model=ScenarioResponse)
def update_scenario(
    scenario_id: int,
    scenario_in: ScenarioUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(write_roles)
):
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found."
        )
    
    update_data = scenario_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(scenario, field, value)
        
    db.commit()
    db.refresh(scenario)
    return scenario
