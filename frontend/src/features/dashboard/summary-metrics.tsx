import { AlertCircle, LibraryBig, ShieldAlert, WalletCards } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const cards = [
  { key: "scenarios", label: "Tracked Scenarios", icon: AlertCircle },
  { key: "playbooks", label: "Playbooks", icon: LibraryBig },
  { key: "pending", label: "Pending Approval", icon: ShieldAlert },
  { key: "flagged", label: "Flagged Portfolios", icon: WalletCards },
] as const;

export function SummaryMetrics({
  scenarios,
  playbooks,
  pending,
  flagged,
}: {
  scenarios: number;
  playbooks: number;
  pending: number;
  flagged: number;
}) {
  const values = { scenarios, playbooks, pending, flagged };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.key}
            className="border-white/60 bg-white/85 shadow-[0_14px_40px_rgba(35,48,66,0.06)]"
          >
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {card.label}
                </div>
                <div className="mt-3 text-4xl font-semibold">
                  {values[card.key]}
                </div>
              </div>
              <div className="rounded-2xl bg-secondary/80 p-3">
                <Icon className="size-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
