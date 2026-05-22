import { create } from "zustand";

import { api } from "@/services/api";
import type {
  ActionRecord,
  ApprovalStatus,
  Client,
  Playbook,
  PlaybookCreatePayload,
  Portfolio,
  Scenario,
  ScenarioTriggerPayload,
} from "@/types";

interface AppState {
  playbooks: Playbook[];
  scenarios: Scenario[];
  actions: ActionRecord[];
  clients: Client[];
  portfolios: Portfolio[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  clearError: () => void;
  loadInitialData: () => Promise<void>;
  createPlaybook: (payload: PlaybookCreatePayload) => Promise<void>;
  triggerScenario: (payload: ScenarioTriggerPayload) => Promise<void>;
  updateActionStatus: (
    actionId: string,
    approvalStatus: ApprovalStatus,
    executionNotes?: string,
  ) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  playbooks: [],
  scenarios: [],
  actions: [],
  clients: [],
  portfolios: [],
  loading: true,
  submitting: false,
  error: null,
  clearError: () => set({ error: null }),
  loadInitialData: async () => {
    set({ loading: true, error: null });
    try {
      const [playbooks, scenarios, actions, clients, portfolios] =
        await Promise.all([
          api.listPlaybooks(),
          api.listScenarios(),
          api.listActions(),
          api.listClients(),
          api.listPortfolios(),
        ]);

      set({
        playbooks,
        scenarios,
        actions,
        clients,
        portfolios,
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to load the dashboard data.",
        loading: false,
      });
    }
  },
  createPlaybook: async (payload) => {
    set({ submitting: true, error: null });
    try {
      const created = await api.createPlaybook(payload);
      set((state) => ({
        playbooks: [created, ...state.playbooks],
        submitting: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the playbook.",
        submitting: false,
      });
    }
  },
  triggerScenario: async (payload) => {
    set({ submitting: true, error: null });
    try {
      const created = await api.createScenario(payload);
      const actions = await api.listActions();
      set((state) => ({
        scenarios: [created, ...state.scenarios.filter((item) => item.id !== created.id)],
        actions,
        submitting: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to analyze the scenario.",
        submitting: false,
      });
    }
  },
  updateActionStatus: async (actionId, approvalStatus, executionNotes) => {
    set({ submitting: true, error: null });
    try {
      const updated = await api.updateActionStatus(
        actionId,
        approvalStatus,
        executionNotes,
      );
      set((state) => ({
        actions: state.actions.map((action) =>
          action.id === actionId ? updated : action,
        ),
        submitting: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the action status.",
        submitting: false,
      });
    }
  },
}));
