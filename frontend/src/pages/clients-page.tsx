import { ClientSegments } from "@/components/client-segments";
import { ClientInsights } from "@/features/clients/client-insights";
import { useAppStore } from "@/store/app-store";

export function ClientsPage() {
  const clients = useAppStore((state) => state.clients);
  const portfolios = useAppStore((state) => state.portfolios);

  return (
    <div className="space-y-5">
      <div className="rounded-[26px] border border-white/60 bg-white/90 p-5 shadow-[0_14px_50px_rgba(35,48,66,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Client Coverage
        </p>
        <h2 className="mt-2 text-3xl">Segments, exposure, and relationship context</h2>
      </div>

      <ClientSegments clients={clients} />
      <ClientInsights clients={clients} portfolios={portfolios} />
    </div>
  );
}
