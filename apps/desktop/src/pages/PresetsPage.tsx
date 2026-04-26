import { useEffect, useState } from "react";
import { api } from "../api/claudePreset";
import GithubImportInput, { ImportPreviewModal } from "../components/GithubImportInput";
import ScopeSelector from "../components/ScopeSelector";
import SelectiveInstallModal from "../components/SelectiveInstallModal";
import { Avatar, Card } from "../components/ui";
import {
  useInstalledStore,
  useMcpsStore,
  usePresetsStore,
  useSkillsStore,
  useUiStore,
} from "../stores";
import type { ImportedBundle, PresetManifest, ScopeArg } from "../types/core";

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="4" />
      <path d="M9.5 9.5L13 13" />
    </svg>
  );
}

function BundleBadges({ manifest }: { manifest: PresetManifest }) {
  const badges: { label: string; tone: "neutral" | "blue" | "green" }[] = [];
  if (manifest.files["CLAUDE.md"]) badges.push({ label: "📄 CLAUDE.md", tone: "neutral" });
  if (manifest.files["settings.json"]) badges.push({ label: "⚙️ settings", tone: "neutral" });
  if (manifest.skills && manifest.skills.length > 0)
    badges.push({ label: `⚡ ${manifest.skills.length} skill${manifest.skills.length > 1 ? "s" : ""}`, tone: "blue" });
  if (manifest.mcps && manifest.mcps.length > 0)
    badges.push({ label: `🔌 ${manifest.mcps.length} MCP${manifest.mcps.length > 1 ? "s" : ""}`, tone: "green" });
  if (badges.length === 0) return null;
  const cls = (tone: string) =>
    tone === "blue"
      ? "bg-app-accent/10 text-app-accent border-app-accent/20"
      : tone === "green"
      ? "bg-app-green/10 text-app-green border-app-green/20"
      : "bg-app-surface text-app-secondary border-app-border";
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map((b) => (
        <span key={b.label} className={`px-2 py-0.5 text-[11px] rounded-full border ${cls(b.tone)}`}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

export default function PresetsPage() {
  const {
    index, loading, error, detailError, sourceMode,
    selectedId, manifest, files,
    fetchIndex, selectPreset,
  } = usePresetsStore();
  const { state: installed, load: loadInstalled } = useInstalledStore();
  const { addToast } = useUiStore();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ScopeArg>({ kind: "global" });
  const [activating, setActivating] = useState(false);
  const [selective, setSelective] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportedBundle | null>(null);
  const skillsStore = useSkillsStore();
  const mcpsStore = useMcpsStore();

  useEffect(() => {
    fetchIndex();
    loadInstalled();
  }, [fetchIndex, loadInstalled]);

  const filtered = (index?.presets ?? []).filter(
    (p) =>
      p.id.includes(query) ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.tags?.some((t) => t.includes(query))
  );

  const isInstalled =
    scope.kind === "global"
      ? installed?.global?.active_preset_id === selectedId
      : scope.kind === "project" && scope.path
      ? installed?.projects?.[scope.path]?.active_preset_id === selectedId
      : false;

  const installLabel = activating
    ? "安装中…"
    : isInstalled
    ? "重新安装"
    : scope.kind === "project"
    ? "安装到项目"
    : "安装到全局";

  async function handleActivate() {
    if (!selectedId) return;
    if (scope.kind === "project" && !scope.path) {
      addToast("请先选择项目目录", "error");
      return;
    }
    setActivating(true);
    try {
      if (sourceMode === "seed") {
        await api.activateSeedPreset(selectedId, scope);
      } else {
        await api.activatePreset(selectedId, scope);
      }
      addToast(`✓ 已安装 ${selectedId}`, "success");
      await loadInstalled();
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setActivating(false);
    }
  }

  return (
    <>
    <div className="flex h-full">
      {/* ── Left: Preset List ── */}
      <div className="w-72 bg-app-surface border-r border-app-border flex flex-col shrink-0">
        {/* Search + Import */}
        <div className="p-3 border-b border-app-border space-y-2">
          <div className="flex items-center gap-2 bg-app-card rounded-lg px-3 py-2 border border-app-border focus-within:border-app-accent transition-colors">
            <span className="text-app-muted"><SearchIcon /></span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索 preset…"
              className="flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-app-muted"
            />
          </div>
          <GithubImportInput onImported={setImportPreview} />
        </div>

        {/* Offline badge */}
        {sourceMode === "seed" && (
          <div className="mx-3 mt-2 flex items-center gap-2 px-3 py-1.5 bg-yellow-900/20 border border-yellow-800/30 rounded-lg text-xs text-yellow-300">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
            离线 · 使用内置预设
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {loading && (
            <div className="text-sm text-app-muted p-2 text-center">加载中…</div>
          )}
          {filtered.map((p) => (
            <Card
              key={p.id}
              active={selectedId === p.id}
              onClick={() => selectPreset(p.id)}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar name={p.name} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-app-text truncate">
                    {p.name}
                    {p.source && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-orange-900/30 text-orange-300 border border-orange-700/40">
                        🔥 热门发现
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-app-muted mt-0.5 truncate">
                    {p.tags?.slice(0, 2).join(" · ")}
                  </div>
                </div>
                <span className="text-xs text-app-muted shrink-0">v{p.version}</span>
              </div>
            </Card>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="p-4 space-y-2 text-center">
              <div className="text-sm text-app-muted">
                {error ? "无法加载远程 preset" : "无匹配 preset"}
              </div>
              {error && (
                <button
                  onClick={() => fetchIndex(true)}
                  className="text-xs text-app-accent hover:underline"
                >
                  重新加载
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Detail Panel ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-app-bg">
        {selectedId && detailError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <span className="text-app-red text-sm">详情加载失败</span>
            <span className="text-xs text-app-muted max-w-xs text-center">{detailError}</span>
            <button
              onClick={() => selectPreset(selectedId)}
              className="text-xs text-app-accent hover:underline"
            >
              重试
            </button>
          </div>
        ) : selectedId && !manifest ? (
          <div className="flex-1 flex items-center justify-center text-app-muted text-sm">
            加载中…
          </div>
        ) : manifest ? (
          <>
            <div className="flex-1 overflow-auto p-5 space-y-4">
              {/* Header card */}
              <div className="bg-app-card border border-app-border rounded-xl p-5 flex items-start gap-4">
                <Avatar name={manifest.name} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <h1 className="text-xl font-bold text-app-text flex-1">
                      {manifest.name}
                    </h1>
                    {isInstalled && (
                      <span className="text-xs px-2.5 py-1 bg-app-green/10 text-app-green border border-app-green/20 rounded-full shrink-0">
                        已安装
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-app-muted mt-1">
                    {manifest.id} · v{manifest.version} · by {manifest.author}
                  </div>
                  <p className="text-sm text-app-secondary mt-3 leading-relaxed">
                    {manifest.description}
                  </p>
                  <BundleBadges manifest={manifest} />
                  {manifest.tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-3">
                      {manifest.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 text-xs bg-app-surface text-app-secondary border border-app-border rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Files card */}
              <div className="bg-app-card border border-app-border rounded-xl p-5">
                <div className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-3">
                  将写入文件
                </div>
                <ul className="space-y-2">
                  {Object.entries(manifest.files).map(([src, target]) => (
                    <li key={src} className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-app-text">{src}</span>
                      <span className="text-app-muted">→</span>
                      <span className="font-mono text-app-secondary">{target}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 bg-yellow-950/20 border border-yellow-800/30 rounded-xl px-4 py-3 text-xs text-yellow-200">
                <span className="text-yellow-500 text-sm shrink-0">⚠</span>
                激活前会先备份同名目标文件，可在 Backups 或 Installed 页面恢复到上一份备份或基线。
              </div>

              {/* File previews */}
              <div className="bg-app-card border border-app-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-app-border text-xs font-semibold text-app-muted uppercase tracking-wider">
                  文件预览
                </div>
                {Object.entries(manifest.files).map(([src, target], i) => (
                  <div key={src} className={i > 0 ? "border-t border-app-border" : ""}>
                    <div className="flex items-center justify-between px-5 py-2.5 bg-app-surface/60">
                      <span className="font-mono text-xs text-app-text">{src}</span>
                      <span className="font-mono text-xs text-app-muted">{target}</span>
                    </div>
                    <pre className="max-h-64 overflow-auto p-4 text-xs leading-5 text-app-secondary whitespace-pre-wrap break-words">
                      {files[src] ?? "加载中…"}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Install bar */}
            <div className="px-5 py-4 bg-app-surface border-t border-app-border flex items-center gap-4 shrink-0">
              <ScopeSelector scope={scope} onChange={setScope} />
              <button
                onClick={() => setSelective(true)}
                className="ml-auto px-3 py-1.5 text-xs bg-app-surface border border-app-border rounded-lg text-app-secondary hover:bg-app-cardHover transition-colors"
              >
                选择性安装
              </button>
              <button
                onClick={handleActivate}
                disabled={activating}
                className="px-6 py-2 bg-app-accent hover:bg-app-accentHover disabled:opacity-50 text-white rounded-full text-sm font-medium transition-colors"
              >
                {installLabel}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-app-muted text-sm">
            <span>选择左侧 preset 查看详情</span>
            {error && (
              <span className="text-xs text-app-muted/60 max-w-xs text-center">{error}</span>
            )}
          </div>
        )}
      </div>
    </div>
    {importPreview && (
      <ImportPreviewModal
        bundle={importPreview}
        onCancel={() => setImportPreview(null)}
        onConfirm={async (name) => {
          const fileContents: Record<string, string> = {};
          const fileMap: Record<string, string> = {};
          if (importPreview.claude_md) {
            fileContents["CLAUDE.md"] = importPreview.claude_md;
            fileMap["CLAUDE.md"] = "CLAUDE.md";
          }
          if (importPreview.settings_json) {
            fileContents["settings.json"] = importPreview.settings_json;
            fileMap["settings.json"] = "settings.json";
          }
          const manifest = {
            id: importPreview.suggested_id,
            name,
            version: "1.0.0",
            description: `从 ${importPreview.source_repo} 导入`,
            author: importPreview.source_repo,
            tags: ["imported"],
            files: fileMap,
          };
          try {
            await api.activateAdHoc(manifest, fileContents, scope);
            await loadInstalled();
            addToast(`✓ 已导入 ${name}`, "success");
            setImportPreview(null);
          } catch (e) {
            addToast(String(e), "error");
          }
        }}
      />
    )}
    {selective && manifest && (
      <SelectiveInstallModal
        manifest={manifest}
        scope={scope}
        onCancel={() => setSelective(false)}
        onConfirm={async (sel) => {
          setSelective(false);
          try {
            if (sel.files.includeAll && Object.keys(manifest.files).length > 0) {
              await api.activatePreset(manifest.id, scope);
            }

            await skillsStore.fetchIndex();
            const selectedSkills = Object.entries(sel.skills).filter(([_, on]) => on);
            const skillResults = await Promise.allSettled(
              selectedSkills.map(([id]) => skillsStore.install(id, scope)),
            );
            skillResults.forEach((r, i) => {
              if (r.status === "rejected") {
                const id = selectedSkills[i][0];
                addToast(`✗ skill ${id}: ${r.reason}`, "error");
              }
            });

            await mcpsStore.fetchIndex();
            const selectedMcps = Object.entries(sel.mcps).filter(([_, st]) => st.selected);
            const mcpResults = await Promise.allSettled(
              selectedMcps.map(([id, st]) => mcpsStore.install(id, scope, st.env)),
            );
            mcpResults.forEach((r, i) => {
              if (r.status === "rejected") {
                const id = selectedMcps[i][0];
                addToast(`✗ MCP ${id}: ${r.reason}`, "error");
              }
            });

            const totalFailures =
              skillResults.filter((r) => r.status === "rejected").length +
              mcpResults.filter((r) => r.status === "rejected").length;
            if (totalFailures === 0) {
              addToast("✓ 选择性安装完成", "success");
            }
          } catch (e) {
            addToast(String(e), "error");
          }
        }}
      />
    )}
    </>
  );
}
