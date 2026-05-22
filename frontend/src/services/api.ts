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
import { request } from "@/services/http";

export const api = {
  listPlaybooks: () => request<Playbook[]>("/playbooks"),
  createPlaybook: (payload: PlaybookCreatePayload) =>
    request<Playbook>("/playbooks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listScenarios: () => request<Scenario[]>("/scenarios"),
  createScenario: (payload: ScenarioTriggerPayload) =>
    request<Scenario>("/scenarios", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listActions: () => request<ActionRecord[]>("/actions"),
  updateActionStatus: (
    actionId: string,
    approvalStatus: ApprovalStatus,
    executionNotes?: string,
  ) =>
    request<ActionRecord>(`/actions/${actionId}`, {
      method: "PUT",
      body: JSON.stringify({
        approval_status: approvalStatus,
        execution_notes: executionNotes ?? null,
      }),
    }),
  listClients: () => request<Client[]>("/clients"),
  listPortfolios: () => request<Portfolio[]>("/portfolios"),
};
