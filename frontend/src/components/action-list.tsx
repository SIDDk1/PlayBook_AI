import { ArrowUpRight, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ActionRecommendation } from "@/types";

export function ActionList({
  actions,
  title = "Recommended Actions",
  compact = false,
}: {
  actions: ActionRecommendation[];
  title?: string;
  compact?: boolean;
}) {
  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="size-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            AI actions will appear here after a scenario is analyzed.
          </p>
        ) : (
          actions.map((action) => (
            <div
              key={`${action.title}-${action.priority}`}
              className="rounded-2xl border border-border/70 bg-background/80 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-medium">{action.title}</div>
                <Badge variant="outline">{action.priority}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {action.description}
              </p>
              {!compact ? (
                <div className="mt-3 flex items-start gap-2 text-sm text-foreground/80">
                  <ArrowUpRight className="mt-0.5 size-4 text-primary" />
                  <span>{action.reason}</span>
                </div>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
