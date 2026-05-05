import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/claudePreset";
import GithubImportInput from "../components/GithubImportInput";
import Topbar from "../components/Topbar";
import { useInstalledStore, useSkillsStore, useUiStore } from "../stores";
import { useScopeStore } from "../stores/scope";
import type { ImportedBundle, SkillMeta } from "../types/core";
import {
  Button,
  Chip,
  EmptyState,
  Glyph,
  SectionLabel,
  Tag,
} from "../components/ui";
import { openExternal } from "../utils/openExternal";

const TOOL_LABEL: Record<string, string> = {
  claude: "Claude",
  codex: "Codex",
  gemini: "Gemini",
  copilot: "Copilot",
};

const ALL = "All";

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const RefreshIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 8a6 6 0 1 1-1.76-4.24" />
    <path d="M14 2v4h-4" />
  </svg>
);

const PlusIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

const GithubIcon = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

function scopeLabel(s: { kind: "global" } | { kind: "project"; path: string }): string {
  return s.kind === "global" ? "globally" : `in ${s.path}`;
}

export default function SkillsPage() {
  const { index, loading, error, installed, fetchIndex, loadInstalled, install, uninstall } =
    useSkillsStore();
  const focusId = useSkillsStore((s) => s.focusId);
  const setFocusId = useSkillsStore((s) => s.setFocusId);
  const { addToast } = useUiStore();
  const installedLoad = useInstalledStore((s) => s.load);
  const scope = useScopeStore((s) => s.scope);

  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [importPreview, setImportPreview] = useState<ImportedBundle | null>(null);
  const [pickerSkillId, setPickerSkillId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchIndex();
  }, [fetchIndex]);

  useEffect(() => {
    loadInstalled(scope);
  }, [scope, loadInstalled]);

  useEffect(() => {
    if (!focusId) return;
    cardRefs.current[focusId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => setFocusId(null), 1500);
    return () => clearTimeout(t);
  }, [focusId, setFocusId]);

  const installedKey = scope.kind === "global" ? "global" : scope.path;
  const installedIds = installed[installedKey] ?? [];

  const categories = useMemo(() => {
    if (!index) return [ALL];
    const set = new Set<string>();
    for (const s of index.skills) set.add(s.category);
    return [ALL, ...Array.from(set).sort()];
  }, [index]);

  const filtered = useMemo(() => {
    if (!index) return [];
    if (activeCategory === ALL) return index.skills;
    return index.skills.filter((s) => s.category === activeCategory);
  }, [index, activeCategory]);

  const total = index?.skills.length ?? 0;
  const installedCount = installedIds.length;

  async function handleInstall(skill: SkillMeta) {
    try {
      await install(skill.id, scope);
      await installedLoad();
      addToast(`已下载到库 ${skill.name}`, "success");
    } catch (e) {
      addToast(`下载失败：${String(e)}`, "error");
    }
  }

  async function handleUninstall(skill: SkillMeta) {
    if (!confirm(`从库移除 ${skill.name}？`)) return;
    try {
      await uninstall(skill.id, scope);
      await installedLoad();
      addToast(`已从库移除 ${skill.name}`, "success");
    } catch (e) {
      addToast(`移除失败：${String(e)}`, "error");
    }
  }

  async function handleImportSkill() {
    if (!importPreview || !pickerSkillId) return;
    const path = Object.keys(importPreview.skills).find(
      (p) => p.split("/")[0] === pickerSkillId,
    );
    if (!path) {
      addToast(`未找到 skill 路径 ${pickerSkillId}`, "error");
      return;
    }
    const content = importPreview.skills[path];
    setImporting(true);
    try {
      // Best-effort: build a single-skill manifest mirroring PresetsPage usage of activateAdHoc.
      // The MVP path here treats the skill as a regular file activation; if backend rejects,
      // user can fall back to importing via Presets. TODO: wire up a dedicated single-skill import.
      const manifest = {
        id: `${importPreview.suggested_id}-${pickerSkillId}`,
        name: pickerSkillId,
        version: "1.0.0",
        description: `Skill 来自 ${importPreview.source_repo}`,
        author: importPreview.source_repo,
        tags: ["imported", "skill"],
        files: { [path]: path },
      };
      const fileContents: Record<string, string> = { [path]: content };
      await api.activateAdHoc(manifest, fileContents, scope);
      await fetchIndex(true);
      addToast(`已导入 skill ${pickerSkillId}`, "success");
      setImportPreview(null);
      setPickerSkillId(null);
    } catch (e) {
      addToast(`导入失败：${String(e)}`, "error");
    } finally {
      setImporting(false);
    }
  }

  if (loading && !index) {
    return (
      <>
        <Topbar title="Skills" crumb="加载中…" actions={null} />
        <div className="content" style={{ color: "var(--ink-3)", fontSize: 13 }}>
          加载中…
        </div>
      </>
    );
  }
  if (error && !index) {
    return (
      <>
        <Topbar title="Skills" crumb="加载失败" actions={null} />
        <div className="content" style={{ color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Skills"
        crumb={`${total} available · ${installedCount} installed ${scopeLabel(scope)}`}
        actions={
          <>
            <GithubImportInput onImported={setImportPreview} />
            <Button size="sm" variant="subtle" onClick={() => fetchIndex(true)} title="刷新">
              {RefreshIcon}
            </Button>
          </>
        }
      />

      <div className="content" style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map((c) => (
            <Tag
              key={c}
              selected={c === activeCategory}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </Tag>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={activeCategory === ALL ? "暂无 skill" : `${activeCategory} 分类下暂无 skill`}
            description="切换分类或刷新数据源。"
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {filtered.map((skill) => {
              const isInstalled = installedIds.includes(skill.id);
              const isFocused = focusId === skill.id;
              return (
                <div
                  key={skill.id}
                  ref={(el) => {
                    cardRefs.current[skill.id] = el;
                  }}
                  className="card"
                  style={{
                    padding: 16,
                    display: "flex",
                    gap: 12,
                    transition: "box-shadow 200ms ease",
                    boxShadow: isFocused ? "0 0 0 3px var(--accent-soft)" : undefined,
                    borderColor: isFocused ? "var(--accent)" : undefined,
                  }}
                >
                  <Glyph name={skill.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {skill.name}
                      </span>
                      <Chip>{skill.category}</Chip>
                      {isInstalled && (
                        <Chip tone="green" dot>
                          installed
                        </Chip>
                      )}
                      {skill.compatible_tools.length > 0 && (
                        <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
                          {skill.compatible_tools.map((t) => (
                            <Chip key={t} tone="blue">
                              {TOOL_LABEL[t] ?? t}
                            </Chip>
                          ))}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: "var(--ink-2)",
                        margin: "6px 0 10px",
                        lineHeight: 1.5,
                      }}
                    >
                      {skill.description}
                    </p>
                    {skill.source?.repo && (
                      <div
                        className="mono"
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          fontSize: 11,
                          color: "var(--ink-3)",
                          marginTop: 6,
                        }}
                      >
                        <span>{skill.source.repo}</span>
                        {typeof skill.source.stars === "number" && skill.source.stars > 0 && (
                          <span>★ {formatStars(skill.source.stars)}</span>
                        )}
                        {skill.source.language && <span>· {skill.source.language}</span>}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        className="mono"
                        style={{ fontSize: 11, color: "var(--ink-3)" }}
                      >
                        v{skill.version}
                      </span>
                      <span style={{ flex: 1 }} />
                      {skill.source?.repo && (
                        <Button
                          size="sm"
                          variant="subtle"
                          onClick={() => openExternal(`https://github.com/${skill.source!.repo}`)}
                          title={`在 GitHub 中打开 ${skill.source.repo}`}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {GithubIcon}
                            <span>GitHub</span>
                          </span>
                        </Button>
                      )}
                      {isInstalled ? (
                        <Button
                          size="sm"
                          variant="subtle"
                          onClick={() => handleUninstall(skill)}
                        >
                          从库移除
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={PlusIcon}
                          onClick={() => handleInstall(skill)}
                        >
                          Install
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {importPreview && Object.keys(importPreview.skills).length > 0 && (
        <div className="modal-shell" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div className="modal" style={{ width: 480 }}>
            <div className="modal-head">
              <SectionLabel>Pick a skill to install</SectionLabel>
              <h3 style={{ margin: 0, fontSize: 18 }}>
                来自 {importPreview.source_repo}
              </h3>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 6 }}>
              {Object.keys(importPreview.skills).map((path) => {
                const id = path.split("/")[0];
                const selected = pickerSkillId === id;
                return (
                  <button
                    key={path}
                    type="button"
                    onClick={() => setPickerSkillId(id)}
                    className="row"
                    style={{
                      borderColor: selected ? "var(--accent)" : "transparent",
                      background: selected ? "var(--accent-soft)" : "var(--card)",
                      textAlign: "left",
                    }}
                  >
                    <div className="name" style={{ fontSize: 13 }}>
                      {id}
                    </div>
                    <div className="meta">{path}</div>
                  </button>
                );
              })}
            </div>
            <div className="modal-foot">
              <Button
                variant="subtle"
                onClick={() => {
                  setImportPreview(null);
                  setPickerSkillId(null);
                }}
              >
                取消
              </Button>
              <Button
                variant="primary"
                disabled={!pickerSkillId || importing}
                onClick={handleImportSkill}
              >
                {importing ? "导入中…" : "导入"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {importPreview && Object.keys(importPreview.skills).length === 0 && (
        <div className="modal-shell" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div className="modal" style={{ width: 420 }}>
            <div className="modal-head">
              <h3 style={{ margin: 0, fontSize: 16 }}>仓库中未发现 skill</h3>
            </div>
            <div className="modal-body" style={{ fontSize: 13, color: "var(--ink-2)" }}>
              来自 {importPreview.source_repo} 的导入未包含 skill 内容。
            </div>
            <div className="modal-foot">
              <Button variant="subtle" onClick={() => setImportPreview(null)}>
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
