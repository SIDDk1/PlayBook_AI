import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { scenarioLabels } from "@/lib/formatters";
import type { PlaybookCreatePayload, ScenarioType } from "@/types";

const scenarioOptions = Object.entries(scenarioLabels) as [ScenarioType, string][];

function linesToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PlaybookForm({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: (payload: PlaybookCreatePayload) => Promise<void>;
}) {
  const [scenarioType, setScenarioType] = useState<ScenarioType>("market_crash");
  const [name, setName] = useState("Advisor Stability Playbook");
  const [description, setDescription] = useState(
    "Structured response for fast-moving risk scenarios with explainable advisor actions.",
  );
  const [triggers, setTriggers] = useState(
    "Client inbound activity spikes\nVolatility threshold breaks\nPortfolio concentration drifts higher",
  );
  const [actions, setActions] = useState(
    "Prioritize high-risk client cohorts\nReview portfolio liquidity and concentration\nDraft account-specific outreach",
  );
  const [guardrails, setGuardrails] = useState(
    "No forced selling without advisor review\nEscalate critical liquidity risk before execution",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      name,
      scenario_type: scenarioType,
      description,
      trigger_conditions: linesToList(triggers),
      impacted_clients: ["high_touch_relationships", "income_accounts"],
      risk_checks: ["Verify liquidity", "Confirm suitability", "Review concentration limits"],
      recommended_actions: linesToList(actions),
      communication_templates: [
        {
          channel: "email",
          audience: "clients",
          subject: "Portfolio update",
          body: "We are reviewing current conditions and will follow up with portfolio-specific guidance.",
        },
      ],
      guardrails: linesToList(guardrails),
      escalation_rules: ["Escalate if risk level is high or critical."],
      approval_workflow: [
        { role: "Lead Advisor", order: 1, required: true, sla_hours: 2 },
      ],
      review_metrics: [
        {
          name: "Response SLA",
          target: "<= 30 min",
          description: "Time to initial client communication.",
        },
      ],
      tags: [scenarioType, "custom"],
    });
  }

  return (
    <Card className="border-white/60 bg-white/90">
      <CardHeader>
        <CardTitle>Create Playbook</CardTitle>
        <CardDescription>
          Add a reusable response path with triggers, actions, guardrails, and a
          lightweight approval workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Playbook Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scenario Type</label>
              <Select
                value={scenarioType}
                onValueChange={(value) => setScenarioType(value as ScenarioType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarioOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger Conditions</label>
              <Textarea
                value={triggers}
                onChange={(event) => setTriggers(event.target.value)}
                className="min-h-32"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Recommended Actions</label>
              <Textarea
                value={actions}
                onChange={(event) => setActions(event.target.value)}
                className="min-h-32"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Guardrails</label>
              <Textarea
                value={guardrails}
                onChange={(event) => setGuardrails(event.target.value)}
                className="min-h-32"
              />
            </div>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Create Playbook"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
