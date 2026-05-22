import { Clock10, MessagesSquare, Siren, Workflow } from "lucide-react";

import { ActionList } from "@/components/action-list";
import { CommunicationPanel } from "@/components/communication-panel";
import { ScenarioAlert } from "@/components/scenario-alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryMetrics } from "@/features/dashboard/summary-metrics";
import { riskBadgeVariant } from "@/lib/formatters";
import { useAppStore } from "@/store/app-store";

export function DashboardPage() {
  const scenarios = useAppStore((state) => state.scenarios);
  const playbooks = useAppStore((state) => state.playbooks);
  const actions = useAppStore((state) => state.actions);
  const portfolios = useAppStore((state) => state.portfolios);
  const latestScenario = scenarios[0];
  const latestAction = actions[0];
  const pendingActions = actions.filter(
    (action) => action.approval_status === "pending_approval",
  );

  return (
    <div className="space-y-5">
      <SummaryMetrics
        scenarios={scenarios.length}
        playbooks={playbooks.length}
        pending={pendingActions.length}
        flagged={portfolios.filter((portfolio) => portfolio.cash_ratio < 5).length}
      />

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/60 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Siren className="size-4 text-primary" />
              Live Scenario Board
            </CardTitle>
            <CardDescription>
              Alerts, matched playbooks, and approval-ready outcomes from the latest
              workflow runs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="scenarios">
              <TabsList>
                <TabsTrigger value="scenarios">Scenario Feed</TabsTrigger>
                <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
              </TabsList>

              <TabsContent value="scenarios" className="mt-4">
                <ScrollArea className="h-[540px] pr-4">
                  <div className="space-y-4">
                    {scenarios.length > 0 ? (
                      scenarios.map((scenario) => (
                        <ScenarioAlert key={scenario.id} scenario={scenario} />
                      ))
                    ) : (
                      <Card className="bg-background/80">
                        <CardContent className="p-6 text-sm text-muted-foreground">
                          No scenarios have been triggered yet.
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="approvals" className="mt-4">
                <div className="space-y-3">
                  {pendingActions.length > 0 ? (
                    pendingActions.map((action) => (
                      <Card key={action.id} className="bg-background/85">
                        <CardContent className="flex items-center justify-between gap-4 p-4">
                          <div>
                            <div className="font-medium">{action.playbook}</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {action.approvals_needed.join(", ") || "Advisor review"}
                            </div>
                          </div>
                          <Badge variant={riskBadgeVariant(action.risk_level)}>
                            {action.risk_level}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-background/80">
                      <CardContent className="p-6 text-sm text-muted-foreground">
                        No actions are currently waiting for approval.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-white/60 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="size-4 text-primary" />
                Current Decision Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestScenario ? (
                <>
                  <div className="rounded-2xl bg-secondary/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Selected Playbook
                        </div>
                        <div className="mt-2 text-xl font-semibold">
                          {latestScenario.analysis.playbook}
                        </div>
                      </div>
                      <Badge variant={riskBadgeVariant(latestScenario.analysis.risk_level)}>
                        {latestScenario.analysis.risk_level}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {latestScenario.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {latestScenario.analysis.explanations.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm text-muted-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Trigger a scenario to populate the decision snapshot.
                </p>
              )}
            </CardContent>
          </Card>

          <ActionList
            title="Top Next-Best-Actions"
            actions={latestAction?.actions ?? []}
            compact
          />

          <CommunicationPanel
            message={latestAction?.client_message}
            heading="Latest Client Draft"
            description="AI-generated outreach aligned to the current scenario."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Detection",
                value: latestScenario
                  ? `${(latestScenario.detection.confidence * 100).toFixed(0)}%`
                  : "N/A",
                icon: Clock10,
              },
              {
                label: "Escalation",
                value: latestScenario?.escalation.requires_escalation ? "Required" : "Clear",
                icon: Siren,
              },
              {
                label: "Messaging",
                value: latestAction?.client_message ? "Ready" : "Pending",
                icon: MessagesSquare,
              },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="bg-white/90">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {label}
                    </div>
                    <div className="mt-2 text-xl font-semibold">{value}</div>
                  </div>
                  <Icon className="size-5 text-primary" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
