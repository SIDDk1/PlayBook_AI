import { Activity, BookOpen, BriefcaseBusiness, Radar, ShieldCheck } from "lucide-react";
import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Activity },
  { to: "/playbooks", label: "Playbooks", icon: BookOpen },
  { to: "/scenarios", label: "Scenario Monitor", icon: Radar },
  { to: "/actions", label: "Actions Panel", icon: ShieldCheck },
  { to: "/clients", label: "Clients", icon: BriefcaseBusiness },
];

export function AppShell({ children }: PropsWithChildren) {
  const loadInitialData = useAppStore((state) => state.loadInitialData);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const clearError = useAppStore((state) => state.clearError);
  const scenarios = useAppStore((state) => state.scenarios.length);
  const playbooks = useAppStore((state) => state.playbooks.length);
  const pending = useAppStore(
    (state) =>
      state.actions.filter((action) => action.approval_status === "pending_approval")
        .length,
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(9,132,120,0.15),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(193,125,36,0.18),_transparent_28%),linear-gradient(180deg,_#f8f7f1_0%,_#f1eee3_100%)] text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1440px] gap-5 px-4 py-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex flex-col rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_80px_rgba(35,48,66,0.08)] backdrop-blur">
          <div className="rounded-[22px] bg-[linear-gradient(135deg,_rgba(9,132,120,0.16),_rgba(255,255,255,0.95)_44%,_rgba(193,125,36,0.16))] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              AI-Assisted
            </p>
            <h1 className="mt-3 text-3xl leading-tight text-balance">
              Playbook Generator
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Market scenario triage, advisor actions, approvals, and client-safe
              communication in one workflow.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-secondary/70 p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Scenarios
              </div>
              <div className="mt-2 text-2xl font-semibold">{scenarios}</div>
            </div>
            <div className="rounded-2xl bg-secondary/70 p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Playbooks
              </div>
              <div className="mt-2 text-2xl font-semibold">{playbooks}</div>
            </div>
            <div className="rounded-2xl bg-secondary/70 p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Pending
              </div>
              <div className="mt-2 text-2xl font-semibold">{pending}</div>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-foreground text-background shadow-lg"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-border/60 bg-background/90 p-4">
            <div className="text-sm font-medium">Provider Switch Ready</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Backend routes every AI call through a single provider interface, so
              Ollama and Groq stay interchangeable.
            </p>
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => void loadInitialData()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Workspace"}
            </Button>
          </div>
        </aside>

        <div className="space-y-5">
          <header className="rounded-[28px] border border-white/60 bg-white/75 px-6 py-5 shadow-[0_16px_60px_rgba(35,48,66,0.08)] backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Advisor command surface
                </p>
                <h2 className="mt-2 text-2xl">
                  Detect, match, approve, and explain the next best move.
                </h2>
              </div>
              <div className="rounded-full bg-secondary/70 px-4 py-2 text-sm text-muted-foreground">
                MVP: manual trigger + AI action generation + approval loop
              </div>
            </div>
          </header>

          {error ? (
            <div className="flex items-center justify-between gap-3 rounded-[22px] border border-red-200 bg-red-50/90 px-5 py-4 shadow-sm backdrop-blur transition-all">
              <div className="flex items-center gap-3 text-red-800">
                <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-sm font-medium">{error}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl text-xs font-semibold text-red-800 hover:bg-red-100 hover:text-red-900"
                onClick={clearError}
              >
                Dismiss
              </Button>
            </div>
          ) : null}

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
