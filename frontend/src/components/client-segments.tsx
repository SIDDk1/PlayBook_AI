import { Landmark, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import type { Client } from "@/types";

export function ClientSegments({ clients }: { clients: Client[] }) {
  const bySegment = clients.reduce<Record<string, { count: number; aua: number }>>(
    (accumulator, client) => {
      const current = accumulator[client.segment] ?? { count: 0, aua: 0 };
      current.count += 1;
      current.aua += client.assets_under_advice;
      accumulator[client.segment] = current;
      return accumulator;
    },
    {},
  );

  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          Client Segments
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {Object.entries(bySegment).map(([segment, value]) => (
          <div
            key={segment}
            className="rounded-2xl border border-border/70 bg-background/90 p-4"
          >
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {segment}
            </div>
            <div className="mt-2 text-2xl font-semibold">{value.count}</div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Landmark className="size-4 text-primary" />
              {formatCurrency(value.aua)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
