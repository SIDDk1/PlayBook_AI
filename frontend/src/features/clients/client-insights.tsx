import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import type { Client, Portfolio } from "@/types";

export function ClientInsights({
  clients,
  portfolios,
}: {
  clients: Client[];
  portfolios: Portfolio[];
}) {
  return (
    <div className="rounded-[26px] border border-white/60 bg-white/90 p-5 shadow-[0_14px_50px_rgba(35,48,66,0.06)]">
      <div className="mb-4">
        <h3 className="text-xl">Client and Portfolio Watchlist</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Concentration, liquidity, and relationship context for advisor review.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Segment</TableHead>
            <TableHead>Portfolio</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Cash Ratio</TableHead>
            <TableHead>Top Holding</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolios.map((portfolio) => {
            const client = clients.find((item) => item.id === portfolio.client_id);
            const topHolding = [...portfolio.holdings].sort(
              (left, right) => right.weight_pct - left.weight_pct,
            )[0];

            return (
              <TableRow key={portfolio.id}>
                <TableCell className="font-medium">{client?.name ?? "Unknown"}</TableCell>
                <TableCell>{client?.segment ?? "N/A"}</TableCell>
                <TableCell>{portfolio.name}</TableCell>
                <TableCell>{formatCurrency(portfolio.total_value)}</TableCell>
                <TableCell>{formatPercentage(portfolio.cash_ratio)}</TableCell>
                <TableCell>
                  {topHolding
                    ? `${topHolding.asset_name} (${formatPercentage(topHolding.weight_pct)})`
                    : "N/A"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
