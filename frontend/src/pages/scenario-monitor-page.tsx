import { ActionList } from "@/components/action-list";
import { CommunicationPanel } from "@/components/communication-panel";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ManualTriggerForm } from "@/features/scenarios/manual-trigger-form";
import { formatScenarioLabel, riskBadgeVariant } from "@/lib/formatters";
import { useAppStore } from "@/store/app-store";

export function ScenarioMonitorPage() {
  const clients = useAppStore((state) => state.clients);
  const portfolios = useAppStore((state) => state.portfolios);
  const triggerScenario = useAppStore((state) => state.triggerScenario);
  const submitting = useAppStore((state) => state.submitting);
  const latestScenario = useAppStore((state) => state.scenarios[0]);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <ManualTriggerForm
        clients={clients}
        portfolios={portfolios}
        submitting={submitting}
        onSubmit={triggerScenario}
      />

      <div className="space-y-5">
        <Card className="border-white/60 bg-white/90">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Latest Scenario Analysis</CardTitle>
                <CardDescription>
                  Detection, matched playbook, risk posture, and explainable output.
                </CardDescription>
              </div>
              {latestScenario ? (
                <Badge variant={riskBadgeVariant(latestScenario.analysis.risk_level)}>
                  {latestScenario.analysis.risk_level}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestScenario ? (
              <>
                <div className="rounded-2xl bg-secondary/70 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Scenario
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {formatScenarioLabel(latestScenario.scenario_type)}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {latestScenario.description}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Playbook
                    </div>
                    <div className="mt-2 font-semibold">
                      {latestScenario.analysis.playbook}
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      Match confidence{" "}
                      {(latestScenario.playbook_match.confidence * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Guardrails
                    </div>
                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                      {latestScenario.risk_summary.guardrail_hits.length > 0 ? (
                        latestScenario.risk_summary.guardrail_hits.map((item) => (
                          <div key={item}>• {item}</div>
                        ))
                      ) : (
                        <div>No active guardrail hits.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
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
              <div className="text-sm text-muted-foreground">
                Trigger a manual scenario to populate the analysis pane.
              </div>
            )}
          </CardContent>
        </Card>

        <ActionList actions={latestScenario?.analysis.actions ?? []} />
        <CommunicationPanel message={latestScenario?.analysis.client_message} />
      </div>
    </div>
  );
}
