// src/components/Layout.tsx
import { Outlet, useLocation } from "react-router-dom";
import {
  useBackupsStore, useConfigStore, useInstalledStore, useMcpsStore,
  usePresetsStore, useRecipesStore, useSkillsStore, useUiStore,
} from "../stores";
import { useEffect, useState } from "react";
import { isTauriApp } from "../api/claudePreset";
import { Banner, Button } from "./ui";
import Sidebar from "./Sidebar";

function BaselineBanner() {
  const { baselineExists, captureBaseline } = useConfigStore();
  const { fetchIndex } = usePresetsStore();
  const { addToast } = useUiStore();
  const [dismissed, setDismissed] = useState(false);
  const [capturing, setCapturing] = useState(false);

  if (baselineExists || dismissed) return null;

  async function handleCapture() {
    setCapturing(true);
    try {
      await captureBaseline();
      addToast("基线已捕获", "success");
      await fetchIndex(true);
      setDismissed(true);
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setCapturing(false);
    }
  }

  return (
    <Banner
      tone="amber"
      lead="建议先捕获基线"
      actions={
        <>
          <Button size="sm" variant="subtle" onClick={() => setDismissed(true)}>跳过</Button>
          <Button size="sm" variant="primary" disabled={capturing} onClick={handleCapture}>
            {capturing ? "捕获中…" : "捕获"}
          </Button>
        </>
      }
    >
      可在任意时刻还原 ~/.claude/ 到当前状态。
    </Banner>
  );
}

export default function Layout() {
  const location = useLocation();
  const isPreview = !isTauriApp();
  const showBaseline = location.pathname !== "/settings";

  const counts = {
    recipes: useRecipesStore((s) => (s.recipes.length || undefined)),
    presets: usePresetsStore((s) => s.index?.presets.length),
    skills:  useSkillsStore((s) => s.index?.skills.length),
    mcps:    useMcpsStore((s) => s.index?.mcps.length),
    installed: useInstalledStore((s) => {
      const st = s.state;
      if (!st) return undefined;
      return (st.global ? 1 : 0) + Object.keys(st.projects ?? {}).length;
    }),
    backups: useBackupsStore((s) => s.entries.length || undefined),
  };

  const fetchPresets = usePresetsStore((s) => s.fetchIndex);
  const fetchSkills = useSkillsStore((s) => s.fetchIndex);
  const fetchMcps = useMcpsStore((s) => s.fetchIndex);
  const loadInstalled = useInstalledStore((s) => s.load);
  const loadBackups = useBackupsStore((s) => s.load);
  const loadRecipes = useRecipesStore((s) => s.load);
  useEffect(() => {
    fetchPresets(); fetchSkills(); fetchMcps();
    loadInstalled(); loadBackups(); loadRecipes();
  }, [fetchPresets, fetchSkills, fetchMcps, loadInstalled, loadBackups, loadRecipes]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--ink)" }}>
      <Sidebar counts={counts} />
      <main style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
        {isPreview && (
          <div style={{ background: "var(--amber-soft)", color: "var(--amber)", fontSize: 11, padding: "4px 22px", borderBottom: "1px solid var(--hairline)" }}>
            预览模式 · 浏览器预览，不会写入真实文件
          </div>
        )}
        {showBaseline && (
          <div style={{ padding: "8px 22px", borderBottom: "1px solid var(--hairline)" }}>
            <BaselineBanner />
          </div>
        )}
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
