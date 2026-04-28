import { useEffect, useMemo, useState } from "react";
import { useInstalledStore, useMcpsStore, useUiStore } from "../stores";
import type { McpMeta, ScopeArg } from "../types/core";
import ScopeSelector from "../components/ScopeSelector";

function groupByCategory(mcps: McpMeta[]): Map<string, McpMeta[]> {
  const m = new Map<string, McpMeta[]>();
  for (const x of mcps) {
    const list = m.get(x.category) ?? [];
    list.push(x);
    m.set(x.category, list);
  }
  return m;
}

function McpRow({
  mcp,
  isInstalled,
  onInstall,
  onUninstall,
}: {
  mcp: McpMeta;
  isInstalled: boolean;
  scope: ScopeArg;
  onInstall: (env: Record<string, string>) => Promise<void>;
  onUninstall: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 py-3">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm text-app-text font-medium">{mcp.name}</div>
          <div className="text-xs text-app-muted mt-1">{mcp.description}</div>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 text-xs rounded-full border ${
            isInstalled
              ? "border-app-green/30 bg-app-green/10 text-app-green"
              : "border-app-border text-app-muted"
          }`}
        >
          {isInstalled ? "已安装" : "未安装"}
        </span>
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-app-border/40">
          <div className="text-[10px] text-app-muted font-mono mb-2">
            {mcp.command} {mcp.args.join(" ")}
          </div>

          <div className="flex justify-end gap-2">
            {isInstalled ? (
              <button
                onClick={onUninstall}
                className="px-3 py-1 text-xs bg-app-surface border border-app-border rounded-lg text-app-red hover:bg-app-red/10"
              >
                从库移除
              </button>
            ) : (
              <button
                onClick={() => onInstall({})}
                className="px-3 py-1 text-xs bg-app-accent rounded-lg text-white hover:bg-app-accentHover"
              >
                下载到库
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function McpPage() {
  const { index, loading, error, installed, fetchIndex, loadInstalled, install, uninstall } =
    useMcpsStore();
  const { addToast } = useUiStore();
  const installedLoad = useInstalledStore((s) => s.load);
  const [scope, setScope] = useState<ScopeArg>({ kind: "global" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchIndex();
  }, [fetchIndex]);

  useEffect(() => {
    loadInstalled(scope);
  }, [scope, loadInstalled]);

  const installedKey = scope.kind === "global" ? "global" : scope.path;
  const installedIds = installed[installedKey] ?? [];

  const filtered = useMemo(() => {
    if (!index) return [];
    const q = search.trim().toLowerCase();
    if (!q) return index.mcps;
    return index.mcps.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q),
    );
  }, [index, search]);

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  async function handleInstall(mcp: McpMeta) {
    try {
      await install(mcp.id, scope, {});
      await installedLoad();
      addToast(`✓ 已下载到库`, "success");
    } catch (e) {
      addToast(`下载失败：${String(e)}`, "error");
    }
  }

  async function handleUninstall(mcp: McpMeta) {
    try {
      await uninstall(mcp.id, scope);
      await installedLoad();
      addToast(`✓ 已卸载 ${mcp.name}`, "success");
    } catch (e) {
      addToast(`卸载失败：${String(e)}`, "error");
    }
  }

  if (loading && !index) {
    return <div className="p-6 text-app-muted text-sm">加载中…</div>;
  }
  if (error && !index) {
    return <div className="p-6 text-app-red text-sm">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-app-border flex items-center gap-3 shrink-0">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索 MCP…"
          className="flex-1 max-w-md bg-app-surface text-sm text-app-text px-3 py-1.5 rounded-lg border border-app-border focus:border-app-accent outline-none transition-colors"
        />
        <ScopeSelector scope={scope} onChange={setScope} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {Array.from(grouped.entries()).map(([category, list]) => (
          <div key={category}>
            <div className="text-xs font-semibold text-app-secondary mb-2 uppercase tracking-wide">
              {category} <span className="text-app-muted">({list.length})</span>
            </div>
            <div className="bg-app-card rounded-xl overflow-hidden divide-y divide-app-border/40">
              {list.map((mcp) => (
                <McpRow
                  key={mcp.id}
                  mcp={mcp}
                  isInstalled={installedIds.includes(mcp.id)}
                  scope={scope}
                  onInstall={() => handleInstall(mcp)}
                  onUninstall={() => handleUninstall(mcp)}
                />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="text-center text-app-muted text-sm py-12">暂无 MCP</div>
        )}
      </div>
    </div>
  );
}
