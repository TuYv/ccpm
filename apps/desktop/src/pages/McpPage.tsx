import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/claudePreset";
import GithubImportInput from "../components/GithubImportInput";
import McpEnvDialog from "../components/McpEnvDialog";
import Topbar from "../components/Topbar";
import { useInstalledStore, useMcpsStore, useUiStore } from "../stores";
import { useScopeStore } from "../stores/scope";
import type { ImportedBundle, McpMeta } from "../types/core";
import {
  Button,
  Chip,
  EmptyState,
  Glyph,
  IconButton,
  SectionLabel,
} from "../components/ui";
import { openExternal } from "../utils/openExternal";
import MarkdownPreview from "../components/MarkdownPreview";

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
  >
    <path d="M4 2L8 6L4 10" />
  </svg>
);

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

const MoreIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="3" cy="8" r="1.4" />
    <circle cx="8" cy="8" r="1.4" />
    <circle cx="13" cy="8" r="1.4" />
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

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface McpRowProps {
  mcp: McpMeta;
  isInstalled: boolean;
  isFocused: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
  onInstall: () => void;
  onConfigure: () => void;
  onUninstall: () => void;
}

function McpRow({
  mcp,
  isInstalled,
  isFocused,
  cardRef,
  onInstall,
  onConfigure,
  onUninstall,
}: McpRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [readmeOpen, setReadmeOpen] = useState<Record<string, boolean>>({});
  function toggleReadme(id: string) {
    setReadmeOpen((m) => ({ ...m, [id]: !m[id] }));
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <div
      ref={cardRef}
      className="card"
      style={{
        padding: "14px 18px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 16,
        alignItems: "center",
        transition: "box-shadow 200ms ease",
        boxShadow: isFocused ? "0 0 0 3px var(--accent-soft)" : undefined,
        borderColor: isFocused ? "var(--accent)" : undefined,
      }}
    >
      <Glyph name={mcp.name} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{mcp.name}</span>
          <Chip>{mcp.category}</Chip>
          {isInstalled && (
            <Chip tone="green" dot>
              active
            </Chip>
          )}
          {mcp.required_env.length > 0 && (
            <Chip tone="amber">requires {mcp.required_env.length} env</Chip>
          )}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--ink-2)",
            margin: "5px 0 6px",
            lineHeight: 1.5,
          }}
        >
          {mcp.description}
        </div>
        {mcp.source?.repo && (
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
            <span>{mcp.source.repo}</span>
            {typeof mcp.source.stars === "number" && mcp.source.stars > 0 && (
              <span>★ {formatStars(mcp.source.stars)}</span>
            )}
            {mcp.source.language && <span>· {mcp.source.language}</span>}
          </div>
        )}
        {mcp.source?.readme && (
          <div style={{ marginTop: 10, borderTop: "1px solid var(--hairline)", paddingTop: 10 }}>
            <button
              type="button"
              onClick={() => toggleReadme(mcp.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                textAlign: "left",
                color: "var(--ink-3)",
                padding: 0,
              }}
            >
              <ChevronIcon open={!!readmeOpen[mcp.id]} />
              <SectionLabel>Upstream README</SectionLabel>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: "auto" }}>
                {readmeOpen[mcp.id] ? "收起" : "展开"}
              </span>
            </button>
            {readmeOpen[mcp.id] && (
              <div style={{ marginTop: 10, maxHeight: 360, overflow: "auto" }}>
                <MarkdownPreview
                  content={mcp.source.readme}
                  baseUrl={`https://github.com/${mcp.source.repo}/blob/${mcp.source.branch}/`}
                />
              </div>
            )}
          </div>
        )}
        <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
          $ {mcp.command} {mcp.args.join(" ")}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", position: "relative" }}>
        {mcp.source?.repo && (
          <Button
            size="sm"
            variant="subtle"
            onClick={() => openExternal(`https://github.com/${mcp.source!.repo}`)}
            title={`在 GitHub 中打开 ${mcp.source.repo}`}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {GithubIcon}
              <span>GitHub</span>
            </span>
          </Button>
        )}
        {isInstalled ? (
          <>
            <Button size="sm" variant="secondary" onClick={onConfigure}>
              Configure
            </Button>
            <div ref={menuRef} style={{ position: "relative" }}>
              <IconButton
                icon={MoreIcon}
                title="更多"
                onClick={() => setMenuOpen((v) => !v)}
              />
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 0,
                    zIndex: 20,
                    minWidth: 140,
                    background: "var(--card)",
                    border: "1px solid var(--hairline)",
                    borderRadius: 8,
                    padding: 4,
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onUninstall();
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "6px 10px",
                      fontSize: 12.5,
                      color: "var(--red)",
                      background: "transparent",
                      border: 0,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    从库移除
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Button size="sm" variant="primary" icon={PlusIcon} onClick={onInstall}>
            Install
          </Button>
        )}
      </div>
    </div>
  );
}

export default function McpPage() {
  const { index, loading, error, installed, fetchIndex, loadInstalled, install, uninstall } =
    useMcpsStore();
  const focusId = useMcpsStore((s) => s.focusId);
  const setFocusId = useMcpsStore((s) => s.setFocusId);
  const { addToast } = useUiStore();
  const installedLoad = useInstalledStore((s) => s.load);
  const scope = useScopeStore((s) => s.scope);

  const [pendingMcp, setPendingMcp] = useState<{
    mcp: McpMeta;
    existing?: Record<string, string>;
  } | null>(null);
  const [importPreview, setImportPreview] = useState<ImportedBundle | null>(null);
  const [pickerMcpId, setPickerMcpId] = useState<string | null>(null);
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

  const sorted = useMemo(() => {
    if (!index) return [];
    return [...index.mcps].sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });
  }, [index]);

  const total = index?.mcps.length ?? 0;
  const installedCount = installedIds.length;

  function clickInstall(mcp: McpMeta) {
    if (mcp.required_env.length === 0) {
      void doInstall(mcp, {});
      return;
    }
    setPendingMcp({ mcp });
  }

  function clickConfigure(mcp: McpMeta) {
    setPendingMcp({ mcp, existing: {} });
  }

  async function doInstall(mcp: McpMeta, env: Record<string, string>) {
    try {
      await install(mcp.id, scope, env);
      await installedLoad();
      addToast(`已安装 ${mcp.name}`, "success");
    } catch (e) {
      addToast(`安装失败：${String(e)}`, "error");
    }
  }

  async function handleUninstall(mcp: McpMeta) {
    if (!confirm(`从库移除 ${mcp.name}？`)) return;
    try {
      await uninstall(mcp.id, scope);
      await installedLoad();
      addToast(`已从库移除 ${mcp.name}`, "success");
    } catch (e) {
      addToast(`移除失败：${String(e)}`, "error");
    }
  }

  async function handleImportMcp() {
    if (!importPreview || !pickerMcpId) return;
    const path = Object.keys(importPreview.mcps).find(
      (p) => p.split("/")[0] === pickerMcpId,
    );
    if (!path) {
      addToast(`未找到 MCP 路径 ${pickerMcpId}`, "error");
      return;
    }
    const content = importPreview.mcps[path];
    setImporting(true);
    try {
      // TODO: backend currently has no dedicated single-MCP import path; we reuse activateAdHoc
      // mirroring the SkillsPage pattern. May need a tailored command in a follow-up.
      const manifest = {
        id: `${importPreview.suggested_id}-${pickerMcpId}`,
        name: pickerMcpId,
        version: "1.0.0",
        description: `MCP 来自 ${importPreview.source_repo}`,
        author: importPreview.source_repo,
        tags: ["imported", "mcp"],
        files: { [path]: path },
      };
      const fileContents: Record<string, string> = { [path]: content };
      await api.activateAdHoc(manifest, fileContents, scope);
      await fetchIndex(true);
      addToast(`已导入 MCP ${pickerMcpId}`, "success");
      setImportPreview(null);
      setPickerMcpId(null);
    } catch (e) {
      addToast(`导入失败：${String(e)}`, "error");
    } finally {
      setImporting(false);
    }
  }

  if (loading && !index) {
    return (
      <>
        <Topbar title="MCP Servers" crumb="加载中…" actions={null} />
        <div className="content" style={{ color: "var(--ink-3)", fontSize: 13 }}>
          加载中…
        </div>
      </>
    );
  }
  if (error && !index) {
    return (
      <>
        <Topbar title="MCP Servers" crumb="加载失败" actions={null} />
        <div className="content" style={{ color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="MCP Servers"
        crumb={`${total} in registry · ${installedCount} active ${scopeLabel(scope)}`}
        actions={
          <>
            <GithubImportInput onImported={setImportPreview} />
            <Button size="sm" variant="subtle" onClick={() => fetchIndex(true)} title="刷新">
              {RefreshIcon}
            </Button>
          </>
        }
      />

      <div className="content" style={{ display: "grid", gap: 12 }}>
        {sorted.length === 0 ? (
          <EmptyState title="暂无 MCP" description="刷新数据源或导入仓库。" />
        ) : (
          sorted.map((mcp) => (
            <McpRow
              key={mcp.id}
              mcp={mcp}
              isInstalled={installedIds.includes(mcp.id)}
              isFocused={focusId === mcp.id}
              cardRef={(el) => {
                cardRefs.current[mcp.id] = el;
              }}
              onInstall={() => clickInstall(mcp)}
              onConfigure={() => clickConfigure(mcp)}
              onUninstall={() => handleUninstall(mcp)}
            />
          ))
        )}
      </div>

      {pendingMcp && (
        <McpEnvDialog
          mcp={pendingMcp.mcp}
          existingEnv={pendingMcp.existing}
          onCancel={() => setPendingMcp(null)}
          onConfirm={async (env) => {
            const target = pendingMcp.mcp;
            setPendingMcp(null);
            await doInstall(target, env);
          }}
        />
      )}

      {importPreview && Object.keys(importPreview.mcps).length > 0 && (
        <div className="modal-shell" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div className="modal" style={{ width: 480 }}>
            <div className="modal-head">
              <SectionLabel>Pick an MCP to install</SectionLabel>
              <h3 style={{ margin: 0, fontSize: 18 }}>
                来自 {importPreview.source_repo}
              </h3>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 6 }}>
              {Object.keys(importPreview.mcps).map((path) => {
                const id = path.split("/")[0];
                const selected = pickerMcpId === id;
                return (
                  <button
                    key={path}
                    type="button"
                    onClick={() => setPickerMcpId(id)}
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
                  setPickerMcpId(null);
                }}
              >
                取消
              </Button>
              <Button
                variant="primary"
                disabled={!pickerMcpId || importing}
                onClick={handleImportMcp}
              >
                {importing ? "导入中…" : "导入"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {importPreview && Object.keys(importPreview.mcps).length === 0 && (
        <div className="modal-shell" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div className="modal" style={{ width: 420 }}>
            <div className="modal-head">
              <h3 style={{ margin: 0, fontSize: 16 }}>仓库中未发现 MCP</h3>
            </div>
            <div className="modal-body" style={{ fontSize: 13, color: "var(--ink-2)" }}>
              来自 {importPreview.source_repo} 的导入未包含 MCP 内容。
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
