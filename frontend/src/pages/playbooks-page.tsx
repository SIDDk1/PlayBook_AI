import { useDeferredValue, useState } from "react";

import { PlaybookCard } from "@/components/playbook-card";
import { Input } from "@/components/ui/input";
import { PlaybookForm } from "@/features/playbooks/playbook-form";
import { useAppStore } from "@/store/app-store";

export function PlaybooksPage() {
  const playbooks = useAppStore((state) => state.playbooks);
  const createPlaybook = useAppStore((state) => state.createPlaybook);
  const submitting = useAppStore((state) => state.submitting);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredPlaybooks = playbooks.filter((playbook) => {
    const haystack =
      `${playbook.name} ${playbook.description} ${playbook.scenario_type} ${playbook.tags.join(" ")}`
        .toLowerCase();
    return haystack.includes(deferredQuery.toLowerCase());
  });

  return (
    <div className="space-y-5">
      <div className="rounded-[26px] border border-white/60 bg-white/90 p-5 shadow-[0_14px_50px_rgba(35,48,66,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Playbook Library
            </p>
            <h2 className="mt-2 text-3xl">Curated response paths for advisor teams</h2>
          </div>
          <div className="w-full lg:max-w-sm">
            <label className="mb-2 block text-sm font-medium">Search library</label>
            <Input
              placeholder="Filter by scenario, keyword, or tag"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      <PlaybookForm submitting={submitting} onSubmit={createPlaybook} />

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {filteredPlaybooks.map((playbook) => (
          <PlaybookCard key={playbook.id} playbook={playbook} />
        ))}
      </div>
    </div>
  );
}
