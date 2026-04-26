import { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Toast from "./components/Toast";
import BackupsPage from "./pages/BackupsPage";
import ClaudeSettingsPage from "./pages/ClaudeSettingsPage";
import InstalledPage from "./pages/InstalledPage";
import McpPage from "./pages/McpPage";
import PresetsPage from "./pages/PresetsPage";
import SettingsPage from "./pages/SettingsPage";
import SkillsPage from "./pages/SkillsPage";
import { useConfigStore } from "./stores";

export default function App() {
  const { load } = useConfigStore();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PresetsPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="mcp" element={<McpPage />} />
          <Route path="installed" element={<InstalledPage />} />
          <Route path="backups" element={<BackupsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="claude-settings" element={<ClaudeSettingsPage />} />
        </Route>
      </Routes>
      <Toast />
    </HashRouter>
  );
}
