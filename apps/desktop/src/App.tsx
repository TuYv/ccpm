import { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { api } from "./api/claudePreset";
import Layout from "./components/Layout";
import RecipeEditor from "./components/RecipeEditor";
import Toast from "./components/Toast";
import BackupsPage from "./pages/BackupsPage";
import ClaudeSettingsPage from "./pages/ClaudeSettingsPage";
import InstalledPage from "./pages/InstalledPage";
import McpPage from "./pages/McpPage";
import PresetsPage from "./pages/PresetsPage";
import RecipesPage from "./pages/RecipesPage";
import SettingsPage from "./pages/SettingsPage";
import SkillsPage from "./pages/SkillsPage";
import { useConfigStore, useUiStore } from "./stores";

export default function App() {
  const { load } = useConfigStore();
  const { addToast } = useUiStore();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const first = await api.isFirstLaunch();
        if (first) {
          const result = await api.scanAndSeed();
          const summary: string[] = [];
          if (result.claude_md_imported) summary.push("CLAUDE.md");
          if (result.skills_imported.length > 0)
            summary.push(`${result.skills_imported.length} skills`);
          if (result.mcps_imported.length > 0)
            summary.push(`${result.mcps_imported.length} MCPs`);
          if (summary.length > 0) {
            addToast(`✓ 已导入现有配置：${summary.join(", ")}`, "success");
          }
        }
      } catch (e) {
        addToast(`首次启动扫描失败：${String(e)}`, "error");
      }
    })();
  }, [addToast]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RecipesPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="recipes/:id" element={<RecipeEditor />} />
          <Route path="recipes/new" element={<RecipeEditor />} />
          <Route path="presets" element={<PresetsPage />} />
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
