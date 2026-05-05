import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { useEffect, useMemo, useState } from "react";
import { api, isTauriApp } from "../api/claudePreset";
import GithubImportInput, { ImportPreviewModal } from "../components/GithubImportInput";
import MarkdownPreview from "../components/MarkdownPreview";
import SelectiveInstallModal from "../components/SelectiveInstallModal";
import Topbar from "../components/Topbar";
import {
  Button,
  Chip,
  EmptyState,
  Glyph,
  SectionLabel,
  Tag,
  TextInput,
} from "../components/ui";
import {
  useInstalledStore,
  useMcpsStore,
  usePresetsStore,
  useSkillsStore,
  useUiStore,
} from "../stores";
import { useScopeStore } from "../stores/scope";
import type {
  ImportedBundle,
  LibraryItemMeta,
  PresetManifest,
  PresetMeta,
  ScopeArg,
} from "../types/core";
import { openExternal } from "../utils/openExternal";

type FilterKey = "all" | "trending" | "skills" | "mcps" | "internal";

const RefreshIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 8a6 6 0 1 1-1.76-4.24" />
    <path d="M14 2v4h-4" />
  </svg>
);

const CopyIcon = (
  <svg
    width="13"
    height="13"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="5" width="9" height="9" rx="1.5" />
    <path d="M2 10V3.5A1.5 1.5 0 0 1 3.5 2H10" />
  </svg>
);

const GithubIcon = (
  <svg
    width="13"
    height="13"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

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

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "trending", label: "Trending" },
  { key: "skills", label: "Skills" },
  { key: "mcps", label: "MCPs" },
  { key: "internal", label: "Internal" },
];

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function basename(p: string): string {
  const trimmed = p.replace(/[/\\]+$/, "");
  const idx = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
  return idx >= 0 ? trimmed.slice(idx + 1) : trimmed;
}

function bytesOf(s: string): string {
  const bytes = new Blob([s]).size;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function lineCount(s: string): number {
  if (!s) return 0;
  return s.split("\n").length;
}

function kindBadge(p: PresetMeta, m?: PresetManifest): string {
  const parts: string[] = [];
  if (m?.files?.["CLAUDE.md"]) parts.push("md");
  if (m?.skills?.length) parts.push("skill");
  if (m?.mcps?.length) parts.push("mcp");
  if (parts.length === 0) {
    if (p.tags?.length) return p.tags[0];
    return "preset";
  }
  return parts.join("·");
}

export default function PresetsPage() {
  const {
    index,
    loading,
    error,
    detailError,
    sourceMode,
    selectedId,
    manifest,
    files,
    fetchIndex,
    selectPreset,
  } = usePresetsStore();
  const { state: installed, load: loadInstalled } = useInstalledStore();
  const { addToast } = useUiStore();
  const skillsStore = useSkillsStore();
  const mcpsStore = useMcpsStore();

  const globalScope = useScopeStore((s) => s.scope);
  const [targetScope, setTargetScope] = useState<ScopeArg>(globalScope);
  useEffect(() => {
    setTargetScope(globalScope);
  }, [globalScope]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [activating, setActivating] = useState(false);
  const [selective, setSelective] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportedBundle | null>(null);
  const [readmeOpen, setReadmeOpen] = useState(false);

  useEffect(() => {
    setReadmeOpen(false);
  }, [selectedId]);

  const [manifestCache, setManifestCache] = useState<Record<string, PresetManifest>>({});

  useEffect(() => {
    fetchIndex();
    loadInstalled();
  }, [fetchIndex, loadInstalled]);

  useEffect(() => {
    if (manifest && manifest.id) {
      setManifestCache((prev) =>
        prev[manifest.id] === manifest ? prev : { ...prev, [manifest.id]: manifest },
      );
    }
  }, [manifest]);

  async function ensureManifests(presets: PresetMeta[]) {
    const missing = presets.filter((p) => !manifestCache[p.id]);
    if (missing.length === 0) return;
    const results = await Promise.allSettled(missing.map((p) => api.getManifest(p.id)));
    setManifestCache((prev) => {
      const next = { ...prev };
      results.forEach((r, i) => {
        if (r.status === "fulfilled") next[missing[i].id] = r.value;
      });
      return next;
    });
  }

  useEffect(() => {
    if ((filter === "skills" || filter === "mcps") && index?.presets) {
      void ensureManifests(index.presets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, index]);

  const trendingThreshold = useMemo(() => {
    const scores = (index?.presets ?? [])
      .map((p) => p.source?.score)
      .filter((s): s is number => typeof s === "number")
      .sort((a, b) => a - b);
    if (scores.length === 0) return Infinity;
    return scores[Math.floor(scores.length * 0.7)];
  }, [index]);

  const filtered = useMemo(() => {
    const presets = index?.presets ?? [];
    const q = search.trim().toLowerCase();
    return presets.filter((p) => {
      if (q) {
        const hay =
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.tags?.some((t) => t.toLowerCase().includes(q)) ?? false);
        if (!hay) return false;
      }
      switch (filter) {
        case "trending":
          return (p.source?.score ?? -Infinity) >= trendingThreshold;
        case "skills":
          return (manifestCache[p.id]?.skills?.length ?? 0) > 0;
        case "mcps":
          return (manifestCache[p.id]?.mcps?.length ?? 0) > 0;
        case "internal":
          return !p.source;
        default:
          return true;
      }
    });
  }, [index, search, filter, manifestCache, trendingThreshold]);

  const total = index?.presets.length ?? 0;
  const internalCount = (index?.presets ?? []).filter((p) => !p.source).length;

  const isInstalled =
    targetScope.kind === "global"
      ? installed?.global?.active_preset_id === selectedId
      : targetScope.kind === "project" && targetScope.path
      ? installed?.projects?.[targetScope.path]?.active_preset_id === selectedId
      : false;

  async function handleDownload(presetId: string) {
    if (!manifest) return;
    setActivating(true);
    try {
      const fileMap = await api.getPresetFiles(presetId);
      const claudeMd = fileMap["CLAUDE.md"];
      const settingsJson = fileMap["settings.json"];
      if (!claudeMd) {
        addToast("此预设没有 CLAUDE.md，无法下载", "error");
        return;
      }
      const meta: LibraryItemMeta = {
        id: presetId,
        name: manifest.name,
        description: manifest.description,
        tags: manifest.tags,
        source: {
          kind: "remote",
          repo: manifest.source?.repo ?? "",
          url: manifest.source?.url ?? "",
        },
        downloaded_at: new Date().toISOString(),
      };
      await api.addLibraryClaudeMd(meta, claudeMd, settingsJson);
      addToast("已下载到库（去「配方」tab 拼装并激活）", "success");
    } catch (e) {
      addToast(`下载失败：${String(e)}`, "error");
    } finally {
      setActivating(false);
    }
  }

  async function pickProjectScope() {
    if (globalScope.kind === "project" && globalScope.path) {
      setTargetScope({ kind: "project", path: globalScope.path });
      return;
    }
    if (!isTauriApp()) {
      addToast("仅桌面端可选择项目目录", "error");
      return;
    }
    try {
      const selected = await openDialog({ directory: true, multiple: false });
      if (typeof selected === "string") {
        setTargetScope({ kind: "project", path: selected });
      }
    } catch (e) {
      addToast(`选择目录失败：${String(e)}`, "error");
    }
  }

  async function copyClaudeMd() {
    const text = files["CLAUDE.md"];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      addToast("已复制 CLAUDE.md", "success");
    } catch (e) {
      addToast(`复制失败：${String(e)}`, "error");
    }
  }

  return (
    <>
      <Topbar
        title="Presets"
        crumb={`${total} 项 · ${internalCount} 内部`}
        actions={
          <>
            <GithubImportInput onImported={setImportPreview} />
            <Button
              size="sm"
              variant="subtle"
              onClick={() => fetchIndex(true)}
              disabled={loading}
              title="刷新"
            >
              {RefreshIcon}
            </Button>
          </>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* ── Left list panel ─────────────────────────────────────── */}
        <div
          style={{
            borderRight: "1px solid var(--hairline)",
            background: "var(--surface)",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "14px 16px 10px" }}>
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter presets…"
            />
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              {FILTER_LABELS.map((f) => (
                <Tag
                  key={f.key}
                  selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </Tag>
              ))}
            </div>
          </div>

          {sourceMode === "seed" && (
            <div
              className="banner"
              style={{
                margin: "0 16px 8px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--hairline)",
                background: "var(--card-2)",
                color: "var(--ink-2)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--amber)",
                  flexShrink: 0,
                }}
              />
              离线 · 使用内置预设
            </div>
          )}

          <div style={{ padding: "0 10px 12px", flex: 1 }}>
            {loading && filtered.length === 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-3)",
                  padding: "16px 8px",
                  textAlign: "center",
                }}
              >
                加载中…
              </div>
            )}

            {filtered.map((p) => {
              const selected = selectedId === p.id;
              const hot = (p.source?.score ?? -Infinity) >= trendingThreshold;
              const cachedManifest = manifestCache[p.id];
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPreset(p.id)}
                  className={`row ${selected ? "active" : "subtle"}`}
                  style={{
                    gridTemplateColumns: "auto 1fr auto",
                    padding: "10px 12px",
                    textAlign: "left",
                    border: 0,
                    width: "100%",
                    cursor: "pointer",
                  }}
                >
                  <Glyph name={p.name} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="name" style={{ fontSize: 13 }}>
                        {p.name}
                      </span>
                      {hot && (
                        <Chip tone="amber" dot>
                          hot
                        </Chip>
                      )}
                      {!p.source && <Chip>internal</Chip>}
                    </div>
                    <div
                      className="meta mono"
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      {p.source?.stars != null && (
                        <span>★ {formatStars(p.source.stars)}</span>
                      )}
                      <span>v{p.version}</span>
                    </div>
                  </div>
                  <span
                    className="mono"
                    style={{ fontSize: 10.5, color: "var(--ink-3)" }}
                  >
                    {kindBadge(p, cachedManifest)}
                  </span>
                </button>
              );
            })}

            {!loading && filtered.length === 0 && (
              <div style={{ padding: "20px 12px" }}>
                <EmptyState
                  title={error ? "无法加载远程 preset" : "无匹配 preset"}
                  description={error ?? undefined}
                  action={
                    error ? (
                      <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => fetchIndex(true)}
                      >
                        重新加载
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Right detail panel ──────────────────────────────────── */}
        <div
          style={{
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            background: "var(--bg)",
          }}
        >
          {selectedId && detailError ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EmptyState
                title="详情加载失败"
                description={detailError}
                action={
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => selectPreset(selectedId)}
                  >
                    重试
                  </Button>
                }
              />
            </div>
          ) : selectedId && !manifest ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink-3)",
                fontSize: 13,
              }}
            >
              加载中…
            </div>
          ) : manifest ? (
            <>
              {/* Header */}
              <div style={{ padding: "22px 28px 0" }}>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  <Glyph name={manifest.name} size="lg" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 24,
                          letterSpacing: "-0.025em",
                          fontWeight: 600,
                        }}
                      >
                        {manifest.name}
                      </h2>
                      {(manifest.source?.score ?? -Infinity) >= trendingThreshold && (
                        <Chip tone="amber" dot>
                          trending
                        </Chip>
                      )}
                      {isInstalled && (
                        <Chip tone="green" dot>
                          已安装
                        </Chip>
                      )}
                      <span style={{ flex: 1 }} />
                      {manifest.source?.repo && (
                        <Button
                          size="sm"
                          variant="subtle"
                          onClick={() =>
                            openExternal(`https://github.com/${manifest.source!.repo}`)
                          }
                          title={`在 GitHub 中打开 ${manifest.source.repo}`}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {GithubIcon}
                            <span>GitHub</span>
                          </span>
                        </Button>
                      )}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 12,
                        color: "var(--ink-3)",
                        marginTop: 4,
                      }}
                    >
                      {manifest.source?.repo ? `${manifest.source.repo} · ` : ""}
                      v{manifest.version}
                      {manifest.source?.stars != null
                        ? ` · ★ ${formatStars(manifest.source.stars)}`
                        : ""}
                      {manifest.author ? ` · by ${manifest.author}` : ""}
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: "var(--ink-2)",
                        lineHeight: 1.55,
                        marginTop: 12,
                        maxWidth: 640,
                      }}
                    >
                      {manifest.description}
                    </p>
                    {manifest.tags?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginTop: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        {manifest.tags.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div
                style={{
                  padding: "20px 28px",
                  display: "grid",
                  gap: 14,
                }}
              >
                {/* Bundle contents */}
                <div className="card" style={{ padding: "14px 18px" }}>
                  <SectionLabel style={{ marginBottom: 10, display: "block" }}>
                    Bundle contents
                  </SectionLabel>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 10,
                    }}
                  >
                    {(() => {
                      const skillsCount = manifest.skills?.length ?? 0;
                      const mcpsCount = manifest.mcps?.length ?? 0;
                      const cells: {
                        lbl: string;
                        val: string;
                        accent?: boolean;
                        muted?: boolean;
                      }[] = [
                        {
                          lbl: "CLAUDE.md",
                          val: manifest.files["CLAUDE.md"] ? "1 file" : "0",
                          muted: !manifest.files["CLAUDE.md"],
                        },
                        {
                          lbl: "settings",
                          val: manifest.files["settings.json"] ? "1 file" : "0",
                          muted: !manifest.files["settings.json"],
                        },
                        {
                          lbl: "skills",
                          val:
                            skillsCount > 0
                              ? `${skillsCount} included`
                              : "0",
                          accent: skillsCount > 0,
                          muted: skillsCount === 0,
                        },
                        {
                          lbl: "mcps",
                          val: mcpsCount > 0 ? `${mcpsCount} included` : "0",
                          muted: mcpsCount === 0,
                        },
                      ];
                      return cells.map((b) => (
                        <div
                          key={b.lbl}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid var(--hairline)",
                            background: b.accent
                              ? "var(--accent-soft)"
                              : "var(--card-2)",
                            opacity: b.muted ? 0.55 : 1,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: b.accent ? "var(--accent-ink)" : "var(--ink)",
                            }}
                          >
                            {b.lbl}
                          </div>
                          <div
                            className="mono"
                            style={{
                              fontSize: 11,
                              color: b.accent ? "var(--accent-ink)" : "var(--ink-3)",
                              marginTop: 2,
                            }}
                          >
                            {b.val}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Files written */}
                {Object.keys(manifest.files).length > 0 && (
                  <div className="card" style={{ padding: "14px 18px" }}>
                    <SectionLabel style={{ marginBottom: 10, display: "block" }}>
                      Files written on activation
                    </SectionLabel>
                    <div style={{ display: "grid", gap: 6 }}>
                      {Object.entries(manifest.files).map(([src, target]) => (
                        <div
                          key={src}
                          className="mono"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto 1fr",
                            alignItems: "center",
                            gap: 10,
                            fontSize: 12,
                            padding: "6px 10px",
                            background: "var(--card-2)",
                            borderRadius: 6,
                          }}
                        >
                          <span style={{ color: "var(--ink)" }}>{src}</span>
                          <span style={{ color: "var(--ink-3)" }}>→</span>
                          <span style={{ color: "var(--ink-3)" }}>{target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* README (collapsible) — auto-discovered presets only */}
                {manifest.source?.readme && (
                  <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                    <button
                      type="button"
                      onClick={() => setReadmeOpen((v) => !v)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        background: "var(--card-2)",
                        border: 0,
                        borderBottom: readmeOpen ? "1px solid var(--hairline)" : "none",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "var(--ink-3)",
                      }}
                    >
                      <ChevronIcon open={readmeOpen} />
                      <SectionLabel>Upstream README</SectionLabel>
                      <span
                        className="mono"
                        style={{ fontSize: 11, color: "var(--ink-3)" }}
                      >
                        {manifest.source.repo}
                      </span>
                      <span style={{ flex: 1 }} />
                      <span
                        className="mono"
                        style={{ fontSize: 11, color: "var(--ink-3)" }}
                      >
                        {bytesOf(manifest.source.readme)} · {readmeOpen ? "收起" : "展开"}
                      </span>
                    </button>
                    {readmeOpen && (
                      <div
                        style={{
                          padding: "16px 20px",
                          maxHeight: 480,
                          overflow: "auto",
                        }}
                      >
                        <MarkdownPreview
                          content={manifest.source.readme}
                          baseUrl={`https://github.com/${manifest.source.repo}/blob/${manifest.source.branch}/`}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* CLAUDE.md preview */}
                <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                  <div
                    style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid var(--hairline)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "var(--card-2)",
                    }}
                  >
                    <span
                      className="mono"
                      style={{ fontSize: 12, color: "var(--ink)" }}
                    >
                      CLAUDE.md
                    </span>
                    <span style={{ flex: 1 }} />
                    {files["CLAUDE.md"] && (
                      <span
                        className="mono"
                        style={{ fontSize: 11, color: "var(--ink-3)" }}
                      >
                        {bytesOf(files["CLAUDE.md"])} · {lineCount(files["CLAUDE.md"])} lines
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="subtle"
                      onClick={copyClaudeMd}
                      disabled={!files["CLAUDE.md"]}
                      title="复制"
                    >
                      {CopyIcon}
                    </Button>
                  </div>
                  {files["CLAUDE.md"] ? (
                    <div
                      style={{
                        padding: "16px 20px",
                        maxHeight: 480,
                        overflow: "auto",
                      }}
                    >
                      <MarkdownPreview
                        content={files["CLAUDE.md"]}
                        baseUrl={
                          manifest.source
                            ? `https://github.com/${manifest.source.repo}/blob/${manifest.source.branch}/${manifest.source.path.replace(/[^/]+$/, "")}`
                            : undefined
                        }
                      />
                    </div>
                  ) : (
                    <div style={{ padding: "24px 16px" }}>
                      <EmptyState
                        title="无 CLAUDE.md"
                        description="此预设未提供 CLAUDE.md 文件。"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky install bar */}
              <div
                style={{
                  marginTop: "auto",
                  padding: "14px 28px",
                  borderTop: "1px solid var(--hairline)",
                  background: "var(--surface)",
                  display: "flex",
                  gap: 10,
                  rowGap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <SectionLabel>Target scope</SectionLabel>
                <div
                  style={{
                    display: "flex",
                    background: "var(--card)",
                    border: "1px solid var(--hairline)",
                    borderRadius: 8,
                    padding: 2,
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setTargetScope({ kind: "global" })}
                    style={{
                      height: 26,
                      padding: "0 14px",
                      fontSize: 12,
                      borderRadius: 6,
                      border: 0,
                      cursor: "pointer",
                      background:
                        targetScope.kind === "global" ? "var(--ink)" : "transparent",
                      color:
                        targetScope.kind === "global" ? "var(--bg)" : "var(--ink-3)",
                    }}
                  >
                    Global
                  </button>
                  <button
                    type="button"
                    onClick={pickProjectScope}
                    style={{
                      height: 26,
                      padding: "0 14px",
                      fontSize: 12,
                      borderRadius: 6,
                      border: 0,
                      cursor: "pointer",
                      background:
                        targetScope.kind === "project" ? "var(--ink)" : "transparent",
                      color:
                        targetScope.kind === "project" ? "var(--bg)" : "var(--ink-3)",
                    }}
                  >
                    Project
                  </button>
                </div>
                {targetScope.kind === "project" && targetScope.path && (
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--ink-3)",
                      flex: "0 1 auto",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={targetScope.path}
                  >
                    {basename(targetScope.path)}
                  </span>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginLeft: "auto",
                    flexShrink: 0,
                  }}
                >
                  <Button variant="subtle" onClick={() => setSelective(true)}>
                    Selective install…
                  </Button>
                  <Button
                    variant="primary"
                    disabled={activating || !selectedId}
                    onClick={() => selectedId && handleDownload(selectedId)}
                  >
                    {activating ? "下载中…" : "下载到库"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EmptyState
                title="选择左侧 preset 查看详情"
                description={error ?? undefined}
              />
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
            const adHocManifest = {
              id: importPreview.suggested_id,
              name,
              version: "1.0.0",
              description: `从 ${importPreview.source_repo} 导入`,
              author: importPreview.source_repo,
              tags: ["imported"],
              files: fileMap,
            };
            try {
              await api.activateAdHoc(adHocManifest, fileContents, targetScope);
              await loadInstalled(true);
              addToast(`已导入 ${name}`, "success");
              setImportPreview(null);
            } catch (e) {
              addToast(`导入失败：${String(e)}`, "error");
            }
          }}
        />
      )}

      {selective && manifest && (
        <SelectiveInstallModal
          manifest={manifest}
          scope={targetScope}
          onCancel={() => setSelective(false)}
          onConfirm={async (sel) => {
            setSelective(false);
            try {
              const hasFiles = Object.keys(manifest.files).length > 0;
              if (sel.files.includeAll && hasFiles) {
                await api.activatePreset(manifest.id, targetScope);
              }

              await skillsStore.fetchIndex();
              const skillIdsToInstall = Object.entries(sel.skills)
                .filter(([, on]) => on)
                .map(([id]) => id);
              const skillResults = await Promise.allSettled(
                skillIdsToInstall.map((id) => skillsStore.install(id, targetScope)),
              );
              skillResults.forEach((r, i) => {
                if (r.status === "rejected") {
                  addToast(`skill ${skillIdsToInstall[i]}: ${r.reason}`, "error");
                }
              });

              await mcpsStore.fetchIndex();
              const mcpEntries = Object.entries(sel.mcps).filter(
                ([, st]) => st.selected,
              );
              const mcpResults = await Promise.allSettled(
                mcpEntries.map(([id, st]) =>
                  mcpsStore.install(id, targetScope, st.env),
                ),
              );
              mcpResults.forEach((r, i) => {
                if (r.status === "rejected") {
                  addToast(`MCP ${mcpEntries[i][0]}: ${r.reason}`, "error");
                }
              });

              await loadInstalled(true);

              const failures =
                skillResults.filter((r) => r.status === "rejected").length +
                mcpResults.filter((r) => r.status === "rejected").length;
              if (failures === 0) {
                addToast("选择性安装完成", "success");
              }
            } catch (e) {
              addToast(`安装失败：${String(e)}`, "error");
            }
          }}
        />
      )}
    </>
  );
}
