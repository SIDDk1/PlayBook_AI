import { ActionList } from "@/components/action-list";
import { CommunicationPanel } from "@/components/communication-panel";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApprovalToolbar } from "@/features/actions/approval-toolbar";
import { riskBadgeVariant } from "@/lib/formatters";
import { useAppStore } from "@/store/app-store";

export function ActionsPage() {
  const actions = useAppStore((state) => state.actions);
  const updateActionStatus = useAppStore((state) => state.updateActionStatus);
  const submitting = useAppStore((state) => state.submitting);

  return (
    <div className="space-y-5">
      <div className="rounded-[26px] border border-white/60 bg-white/90 p-5 shadow-[0_14px_50px_rgba(35,48,66,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Actions Panel
        </p>
        <h2 className="mt-2 text-3xl">Approval-ready next best actions</h2>
      </div>

      <div className="space-y-5">
        {actions.map((action) => (
          <Card key={action.id} className="border-white/60 bg-white/90">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle>{action.playbook}</CardTitle>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Scenario: {action.scenario}
                  </div>
                </div>
                <Badge variant={riskBadgeVariant(action.risk_level)}>
                  {action.risk_level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <ActionList actions={action.actions} compact={false} />

              <div className="grid gap-3 md:grid-cols-2">
                {action.explanations.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <ApprovalToolbar
                action={action}
                submitting={submitting}
                onStatusChange={async (approvalStatus, executionNotes) =>
                  updateActionStatus(action.id, approvalStatus, executionNotes)
                }
              />

              <CommunicationPanel
                message={action.client_message}
                heading="Suggested Client Message"
                description="Draft communication aligned to this action record."
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
