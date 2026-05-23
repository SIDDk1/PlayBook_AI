from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from config.database import get_db
from auth.deps import get_current_user
from models.user import User
from models.approval import Approval, Workflow
from models.communication import Communication

router = APIRouter()

class ApprovalActionIn(BaseModel):
    action: str  # "Approved" or "Rejected"
    comments: Optional[str] = None

class ApprovalResponse(BaseModel):
    id: int
    workflow_id: int
    approver_role: str
    status: str
    comments: Optional[str] = None
    actioned_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.get("/pending", response_model=List[ApprovalResponse])
def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch all pending approvals where the role of the user matches the approver_role
    if not current_user.role:
        return []
        
    return db.query(Approval).filter(
        Approval.status == "Pending",
        Approval.approver_role == current_user.role.name
    ).all()

@router.post("/{approval_id}/action", response_model=ApprovalResponse)
def action_approval(
    approval_id: int,
    action_in: ApprovalActionIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if action_in.action not in ["Approved", "Rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action must be either 'Approved' or 'Rejected'."
        )

    # Fetch approval
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval record not found."
        )

    # Verify user has correct role to action this approval
    if not current_user.role or approval.approver_role != current_user.role.name:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only users with role '{approval.approver_role}' can action this approval."
        )

    # Update approval status
    approval.status = action_in.action
    approval.comments = action_in.comments
    approval.actioned_by_id = current_user.id
    approval.actioned_at = datetime.utcnow()

    # Workflow state machine logic
    workflow = db.query(Workflow).filter(Workflow.id == approval.workflow_id).first()
    if workflow:
        if action_in.action == "Rejected":
            # If one approver rejects, the entire workflow is rejected
            workflow.status = "Rejected"
        else:
            # Check if all approvals for this workflow are now Approved
            remaining_approvals = db.query(Approval).filter(
                Approval.workflow_id == workflow.id,
                Approval.status == "Pending"
            ).count()
            
            if remaining_approvals == 0:
                # All steps approved -> mark workflow as Completed
                workflow.status = "Completed"
                
                # Mark communications related to this workflow as Sent (representing execution)
                comms = db.query(Communication).filter(
                    Communication.workflow_id == workflow.id,
                    Communication.status == "Draft"
                ).all()
                for comm in comms:
                    comm.status = "Sent"
                    comm.sent_at = datetime.utcnow()

    db.commit()
    db.refresh(approval)
    return approval
