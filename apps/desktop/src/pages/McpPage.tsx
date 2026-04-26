import { useEffect, useMemo, useState } from "react";
import { useMcpsStore, useUiStore } from "../stores";
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
  scope,
  onInstall,
  onUninstall,
}: {
  mcp: McpMeta;
  isInstalled: boolean;
  scope: ScopeArg;
  onInstall: (env: Record<string, string>) => void;
  onUninstall: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [env, setEnv] = useState<Record<string, string>>({});

  const requiredFilled = mcp.required_env.every((r) => (env[r.key] ?? "").length > 0);

  return (
    <div className="px-4 py-3">
      <button
        onClick={() => setOpen(!open)}
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

          {mcp.required_env.length > 0 && (
            <div className="space-y-2 mb-3">
              {mcp.required_env.map((r) => (
                <div key={r.key} className="flex items-center gap-2">
                  <label className="text-xs text-app-secondary w-32 shrink-0 font-mono">
                    {r.key}
                  </label>
                  <input
                    value={env[r.key] ?? ""}
                    onChange={(e) =>
                      setEnv((prev) => ({ ...prev, [r.key]: e.target.value }))
                    }
                    placeholder={r.hint || r.description}
                    className="flex-1 bg-app-surface text-xs text-app-text px-2 py-1 rounded border border-app-border focus:border-app-accent outline-none font-mono"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {isInstalled ? (
              <button
                onClick={onUninstall}
                className="px-3 py-1 text-xs bg-app-surface border border-app-border rounded-lg text-app-red hover:bg-app-red/10 transition-colors"
              >
                卸载
              </button>
            ) : (
              <button
                onClick={() => onInstall(env)}
                disabled={!requiredFilled}
                className="px-3 py-1 text-xs bg-app-accent rounded-lg text-white hover:bg-app-accentHover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {scope.kind === "global" ? "全局安装" : "项目安装"}
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

  async function handleInstall(mcp: McpMeta, env: Record<string, string>) {
    try {
      await install(mcp.id, scope, env);
      addToast(`✓ 已安装 ${mcp.name}`, "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function handleUninstall(mcp: McpMeta) {
    try {
      await uninstall(mcp.id, scope);
      addToast(`✓ 已卸载 ${mcp.name}`, "success");
    } catch (e) {
      addToast(String(e), "error");
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
                  onInstall={(env) => handleInstall(mcp, env)}
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
