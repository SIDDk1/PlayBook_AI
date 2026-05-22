import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatScenarioLabel, riskBadgeVariant } from "@/lib/formatters";
import type { Scenario } from "@/types";

export function ScenarioAlert({ scenario }: { scenario: Scenario }) {
  return (
    <Card className="border-l-4 border-l-primary/60 bg-white/95">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-primary" />
              {scenario.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {formatScenarioLabel(scenario.scenario_type)} · confidence{" "}
              {(scenario.detection.confidence * 100).toFixed(0)}%
            </CardDescription>
          </div>
          <Badge variant={riskBadgeVariant(scenario.risk_summary.risk_level)}>
            {scenario.risk_summary.risk_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">
          {scenario.detection.narrative}
        </p>
        <div className="flex flex-wrap gap-2">
          {scenario.playbook_match.selected_playbook_name ? (
            <Badge variant="secondary">
              <CheckCircle2 className="mr-1 size-3" />
              {scenario.playbook_match.selected_playbook_name}
            </Badge>
          ) : null}
          {scenario.affected_sectors.map((sector) => (
            <Badge key={sector} variant="outline">
              {sector}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
