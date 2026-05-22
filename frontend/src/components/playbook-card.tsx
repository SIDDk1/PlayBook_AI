import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatScenarioLabel } from "@/lib/formatters";
import type { Playbook } from "@/types";

export function PlaybookCard({ playbook }: { playbook: Playbook }) {
  return (
    <Card className="h-full border-white/60 bg-white/90 shadow-[0_14px_50px_rgba(35,48,66,0.06)]">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{formatScenarioLabel(playbook.scenario_type)}</Badge>
          {playbook.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="mt-3">{playbook.name}</CardTitle>
        <CardDescription>{playbook.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trigger Conditions
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {playbook.trigger_conditions.slice(0, 3).map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <Separator />
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Shield className="size-3.5" />
            Guardrails
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {playbook.guardrails.slice(0, 2).map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Approval Steps
        </span>
        <span className="text-sm font-medium">
          {playbook.approval_workflow.length || 0}
        </span>
      </CardFooter>
    </Card>
  );
}
