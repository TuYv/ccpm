import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { isTauriApp } from "../api/claudePreset";
import { useConfigStore, useMcpsStore, usePresetsStore, useSkillsStore, useUiStore } from "../stores";
import { IconButton, SidebarItem, Toolbar } from "./ui";

const NAV_ITEMS = [
  { to: "/", label: "配方", end: true },
  { to: "/presets", label: "预设" },
  { to: "/skills", label: "Skills" },
  { to: "/mcp", label: "MCP" },
  { to: "/installed", label: "已安装" },
  { to: "/backups", label: "备份" },
  { to: "/claude-settings", label: "Claude 配置" },
];

function pageTitle(pathname: string) {
  if (pathname === "/" || pathname.startsWith("/recipes")) return "配方";
  if (pathname.startsWith("/presets")) return "预设";
  if (pathname.startsWith("/skills")) return "Skills";
  if (pathname.startsWith("/mcp")) return "MCP";
  if (pathname.startsWith("/installed")) return "已安装";
  if (pathname.startsWith("/backups")) return "备份";
  if (pathname.startsWith("/claude-settings")) return "Claude 配置";
  if (pathname.startsWith("/settings")) return "设置";
  return "Claude Preset";
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5V3M8 13v1.5M14.5 8H13M3 8H1.5M12.36 3.64l-1.06 1.06M4.7 11.3l-1.06 1.06M12.36 12.36l-1.06-1.06M4.7 4.7 3.64 3.64" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 2.5A7 7 0 1 1 8 1M13.5 2.5V6M13.5 2.5H10" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}

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
      addToast("✓ 基线已捕获", "success");
      await fetchIndex(true);
      setDismissed(true);
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setCapturing(false);
    }
  }

  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-yellow-900/20 border-b border-yellow-800/30 text-xs text-yellow-200 shrink-0">
      <span className="flex-1">建议先捕获 ~/.claude/ 基线快照，以便随时还原</span>
      <button onClick={() => setDismissed(true)} className="text-yellow-600 hover:text-yellow-300 transition-colors">
        跳过
      </button>
      <button
        onClick={handleCapture}
        disabled={capturing}
        className="px-3 py-1 bg-yellow-700/50 hover:bg-yellow-600/70 disabled:opacity-50 rounded-full text-white transition-colors"
      >
        {capturing ? "捕获中…" : "捕获基线"}
      </button>
    </div>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchIndex } = usePresetsStore();
  const { fetchIndex: fetchSkills } = useSkillsStore();
  const { fetchIndex: fetchMcps } = useMcpsStore();
  const presetsLoading = usePresetsStore((s) => s.loading);
  const skillsLoading = useSkillsStore((s) => s.loading);
  const mcpsLoading = useMcpsStore((s) => s.loading);
  const loading =
    location.pathname === "/skills" ? skillsLoading
    : location.pathname === "/mcp" ? mcpsLoading
    : presetsLoading;
  const isPreview = !isTauriApp();
  const isSettings = location.pathname === "/settings";

  const refresh = () => {
    if (location.pathname === "/skills") fetchSkills(true);
    else if (location.pathname === "/mcp") fetchMcps(true);
    else fetchIndex(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg text-app-text">
      <aside className="flex w-[216px] shrink-0 flex-col border-r border-app-border bg-app-sidebar">
        <div className="flex h-14 items-center px-4">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-bold text-app-accent">
              Claude Preset
            </div>
            <div className="truncate text-[11px] text-app-muted">Workbench</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="border-t border-app-border px-3 py-3">
          <SidebarItem to="/settings" label="设置" icon={<GearIcon />} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {isPreview && (
          <div className="flex items-center justify-center px-4 py-1 bg-orange-900/30 border-b border-orange-800/40 text-xs text-orange-300 shrink-0">
            预览模式 · 浏览器预览，不会写入真实文件
          </div>
        )}
        <BaselineBanner />

        <Toolbar
          title={pageTitle(location.pathname)}
          left={
            isSettings ? (
              <IconButton icon={<BackIcon />} title="返回" onClick={() => navigate(-1)} />
            ) : undefined
          }
          right={
            !isSettings ? (
              <IconButton
                icon={<RefreshIcon />}
                title="刷新数据源"
                onClick={refresh}
                disabled={loading}
              />
            ) : undefined
          }
        />

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
