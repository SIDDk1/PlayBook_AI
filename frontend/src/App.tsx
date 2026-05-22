import { Navigate, Route, Routes } from "react-router-dom";

import { ActionsPage } from "@/pages/actions-page";
import { AppShell } from "@/components/app-shell";
import { ClientsPage } from "@/pages/clients-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { PlaybooksPage } from "@/pages/playbooks-page";
import { ScenarioMonitorPage } from "@/pages/scenario-monitor-page";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/playbooks" element={<PlaybooksPage />} />
        <Route path="/scenarios" element={<ScenarioMonitorPage />} />
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
