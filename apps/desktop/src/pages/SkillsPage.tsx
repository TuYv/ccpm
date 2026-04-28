import { useEffect, useMemo, useState } from "react";
import { useInstalledStore, useSkillsStore, useUiStore } from "../stores";
import type { ScopeArg, SkillMeta } from "../types/core";
import ScopeSelector from "../components/ScopeSelector";
import { Badge, Button, EmptyState, Panel, TextInput } from "../components/ui";

const TOOL_LABEL: Record<string, string> = {
  claude: "Claude",
  codex: "Codex",
  gemini: "Gemini",
  copilot: "Copilot",
};

function CompatibilityBadges({ tools }: { tools: string[] }) {
  if (tools.length === 0) return null;
  return (
    <div className="flex gap-1 flex-wrap">
      {tools.map((t) => (
        <span
          key={t}
          className="px-1.5 py-0.5 text-[10px] rounded bg-app-surface border border-app-border text-app-secondary"
        >
          {TOOL_LABEL[t] ?? t}
        </span>
      ))}
    </div>
  );
}

function groupByCategory(skills: SkillMeta[]): Map<string, SkillMeta[]> {
  const m = new Map<string, SkillMeta[]>();
  for (const s of skills) {
    const list = m.get(s.category) ?? [];
    list.push(s);
    m.set(s.category, list);
  }
  return m;
}

export default function SkillsPage() {
  const { index, loading, error, installed, fetchIndex, loadInstalled, install, uninstall } =
    useSkillsStore();
  const { addToast } = useUiStore();
  const installedLoad = useInstalledStore((s) => s.load);
  const [scope, setScope] = useState<ScopeArg>({ kind: "global" });
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

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
    if (!q) return index.skills;
    return index.skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q),
    );
  }, [index, search]);

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  async function handleInstall(skill: SkillMeta) {
    try {
      await install(skill.id, scope);
      await installedLoad();
      addToast(`✓ 已下载到库 ${skill.name}`, "success");
    } catch (e) {
      addToast(`下载失败：${String(e)}`, "error");
    }
  }

  async function handleUninstall(skill: SkillMeta) {
    try {
      await uninstall(skill.id, scope);
      await installedLoad();
      addToast(`✓ 已从库移除 ${skill.name}`, "success");
    } catch (e) {
      addToast(`移除失败：${String(e)}`, "error");
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
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索 skills…"
          className="max-w-md"
        />
        <ScopeSelector scope={scope} onChange={setScope} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {Array.from(grouped.entries()).map(([category, list]) => (
          <div key={category}>
            <div className="text-xs font-semibold text-app-secondary mb-2 uppercase tracking-wide">
              {category} <span className="text-app-muted">({list.length})</span>
            </div>
            <Panel className="overflow-hidden divide-y divide-app-borderSubtle">
              {list.map((skill) => {
                const isInstalled = installedIds.includes(skill.id);
                const isOpen = openId === skill.id;
                return (
                  <div key={skill.id} className="px-4 py-3">
                    <button
                      onClick={() => setOpenId(isOpen ? null : skill.id)}
                      aria-expanded={isOpen}
                      className="w-full flex items-start justify-between gap-4 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-app-text font-medium">{skill.name}</span>
                          <CompatibilityBadges tools={skill.compatible_tools} />
                        </div>
                        <div className="text-xs text-app-muted mt-1">{skill.description}</div>
                      </div>
                      {isInstalled ? <Badge tone="success">已下载</Badge> : <Badge>未下载</Badge>}
                    </button>

                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-app-borderSubtle flex flex-wrap items-center gap-2">
                        <code className="text-[10px] font-mono text-app-muted bg-app-surface px-2 py-0.5 rounded">
                          {skill.install_path}
                        </code>
                        <span className="text-[10px] text-app-muted">v{skill.version} · {skill.author}</span>
                        <div className="ml-auto flex gap-2">
                          {isInstalled ? (
                            <Button variant="danger" size="sm" onClick={() => handleUninstall(skill)}>
                              从库移除
                            </Button>
                          ) : (
                            <Button variant="primary" size="sm" onClick={() => handleInstall(skill)}>
                              下载到库
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </Panel>
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <EmptyState
            title={search ? `没有匹配 "${search}" 的 skill` : "暂无 skill"}
            description="调整搜索条件或刷新数据源。"
          />
        )}
      </div>
    </div>
  );
}
