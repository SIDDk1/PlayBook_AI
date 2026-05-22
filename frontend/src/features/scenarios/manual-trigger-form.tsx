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
import type {
  Client,
  Portfolio,
  RiskLevel,
  ScenarioTriggerPayload,
  ScenarioType,
} from "@/types";

const scenarioOptions = Object.entries(scenarioLabels) as [ScenarioType, string][];
const riskOptions: RiskLevel[] = ["low", "moderate", "high", "critical"];

export function ManualTriggerForm({
  clients,
  portfolios,
  submitting,
  onSubmit,
}: {
  clients: Client[];
  portfolios: Portfolio[];
  submitting: boolean;
  onSubmit: (payload: ScenarioTriggerPayload) => Promise<void>;
}) {
  const [scenarioType, setScenarioType] = useState<ScenarioType>("market_crash");
  const [title, setTitle] = useState("Broad equity drawdown alert");
  const [description, setDescription] = useState(
    "Equity indices are down sharply and inbound client anxiety is rising across income and growth segments.",
  );
  const [clientId, setClientId] = useState("");
  const [portfolioId, setPortfolioId] = useState("");
  const [metric, setMetric] = useState("S&P 500 drawdown");
  const [signalValue, setSignalValue] = useState("-8.1%");
  const [affectedSectors, setAffectedSectors] = useState("technology, financials");
  const [region, setRegion] = useState("United States");
  const [severity, setSeverity] = useState<RiskLevel>("high");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      title,
      scenario_type: scenarioType,
      description,
      trigger_source: "manual",
      client_ids: clientId ? [clientId] : [],
      portfolio_ids: portfolioId ? [portfolioId] : [],
      market_signals: [
        {
          metric,
          value: signalValue,
          note: description,
        },
      ],
      affected_sectors: affectedSectors
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      region,
      severity_hint: severity,
    });
  }

  return (
    <Card className="border-white/60 bg-white/90">
      <CardHeader>
        <CardTitle>Manual Scenario Trigger</CardTitle>
        <CardDescription>
          Launch the end-to-end pipeline: detection, playbook match, AI action
          generation, risk checks, and approvals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity Hint</label>
              <Select
                value={severity}
                onValueChange={(value) => setSeverity(value as RiskLevel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose severity" />
                </SelectTrigger>
                <SelectContent>
                  {riskOptions.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Alert Title</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Scenario Description</label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select
                value={clientId || null}
                onValueChange={(value) => setClientId(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Optional client scope" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Portfolio</label>
              <Select
                value={portfolioId || null}
                onValueChange={(value) => setPortfolioId(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Optional portfolio scope" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium">Signal Metric</label>
              <Input value={metric} onChange={(event) => setMetric(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Signal Value</label>
              <Input
                value={signalValue}
                onChange={(event) => setSignalValue(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Affected Sectors</label>
              <Input
                value={affectedSectors}
                onChange={(event) => setAffectedSectors(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Input value={region} onChange={(event) => setRegion(event.target.value)} />
            </div>
          </div>

          <Button className="w-full sm:w-auto" type="submit" disabled={submitting}>
            {submitting ? "Running analysis..." : "Trigger Scenario"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
