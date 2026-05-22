import { Check, Clock3, PlayCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { approvalTone } from "@/lib/formatters";
import type { ActionRecord, ApprovalStatus } from "@/types";

export function ApprovalToolbar({
  action,
  submitting,
  onStatusChange,
}: {
  action: ActionRecord;
  submitting: boolean;
  onStatusChange: (
    approvalStatus: ApprovalStatus,
    executionNotes?: string,
  ) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/70 p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Approval Status
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{approvalTone(action.approval_status)}</Badge>
          {action.approvals_needed.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              Needs: {action.approvals_needed.join(", ")}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            void onStatusChange("pending_approval", "Awaiting reviewer sign-off.")
          }
          disabled={submitting}
        >
          <Clock3 className="size-4" />
          Queue
        </Button>
        <Button
          size="sm"
          onClick={() =>
            void onStatusChange("approved", "Approved for advisor execution.")
          }
          disabled={submitting}
        >
          <Check className="size-4" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() =>
            void onStatusChange("rejected", "Rejected pending additional review.")
          }
          disabled={submitting}
        >
          <X className="size-4" />
          Reject
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            void onStatusChange(
              "executed",
              "Advisor action executed and ready for review.",
            )
          }
          disabled={submitting}
        >
          <PlayCircle className="size-4" />
          Execute
        </Button>
      </div>
    </div>
  );
}
