import { useEffect, useMemo, useState } from "react";
import { isTauriApp } from "../api/claudePreset";
import { useConfigStore, usePresetsStore, useUiStore } from "../stores";
import type { AppConfig, SourceEntry } from "../types/core";
import Topbar from "../components/Topbar";
import { useTheme } from "../hooks/useTheme";
import {
  Button,
  Field,
  SectionLabel,
  TextInput,
} from "../components/ui";

const DEFAULT_SOURCE_URL =
  "https://raw.githubusercontent.com/TuYv/ccpm/main/preset-registry";

const SECTIONS: [string, string][] = [
  ["appearance", "外观"],
  ["sources", "数据源"],
  ["github", "GitHub"],
  ["about", "关于"],
];

const ACCENT_HUE_KEY = "ccpm_accent_hue";

function readAccentHue(): number {
  try {
    const raw = localStorage.getItem(ACCENT_HUE_KEY);
    if (!raw) return 28;
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0 && n <= 360) return n;
  } catch {}
  return 28;
}

function applyAccentHue(h: number) {
  document.documentElement.style.setProperty("--accent-h", String(h));
}

// ── appearance ─────────────────────────────────────────────────────────────
function AppearanceSection() {
  const { mode, setMode } = useTheme();
  const [accentHue, setAccentHueState] = useState<number>(() => readAccentHue());

  useEffect(() => {
    applyAccentHue(accentHue);
  }, [accentHue]);

  function setAccentHue(h: number) {
    setAccentHueState(h);
    try {
      localStorage.setItem(ACCENT_HUE_KEY, String(h));
    } catch {}
  }

  return (
    <>
      <h3
        style={{
          margin: 0,
          fontSize: 18,
          letterSpacing: "-0.02em",
          fontWeight: 600,
        }}
      >
        外观
      </h3>
      <p style={{ margin: "4px 0 16px", color: "var(--ink-3)", fontSize: 13 }}>
        主题模式与强调色。
      </p>
      <div className="card" style={{ padding: 18, display: "grid", gap: 16 }}>
        <Field label="主题模式">
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 3,
              background: "var(--card-2)",
              borderRadius: 8,
              width: "fit-content",
            }}
          >
            {(["system", "light", "dark"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  padding: "5px 14px",
                  fontSize: 12,
                  borderRadius: 5,
                  border: 0,
                  cursor: "pointer",
                  background: mode === m ? "var(--card)" : "transparent",
                  color: mode === m ? "var(--ink)" : "var(--ink-3)",
                  fontWeight: mode === m ? 600 : 500,
                  boxShadow: mode === m ? "var(--shadow-sm)" : "none",
                }}
              >
                {m === "system" ? "跟随系统" : m === "light" ? "浅色" : "深色"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="强调色相" helper="拖动调整全局强调色。">
          <input
            type="range"
            min={0}
            max={360}
            step={2}
            value={accentHue}
            onChange={(e) => setAccentHue(Number(e.target.value))}
            style={{ width: 240 }}
          />
          <span
            className="mono"
            style={{ marginLeft: 12, color: "var(--ink-3)", fontSize: 12 }}
          >
            {accentHue}°
          </span>
        </Field>
      </div>
    </>
  );
}

// ── sources ────────────────────────────────────────────────────────────────
function SourcesSection({
  draft,
  setDraft,
}: {
  draft: AppConfig;
  setDraft: (next: AppConfig) => void;
}) {
  const sourceMode = usePresetsStore((s) => s.sourceMode);
  const lastUpdated = usePresetsStore((s) => s.lastUpdated);
  const registryError = usePresetsStore((s) => s.error);
  const fetchIndex = usePresetsStore((s) => s.fetchIndex);
  const addToast = useUiStore((s) => s.addToast);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefreshRegistry() {
    setRefreshing(true);
    try {
      await fetchIndex(true);
      const mode = usePresetsStore.getState().sourceMode;
      if (mode === "remote") addToast("远程源已刷新", "success");
      else addToast("远程源不可用，已使用内置预设", "error");
    } finally {
      setRefreshing(false);
    }
  }

  function updateSource(idx: number, patch: Partial<SourceEntry>) {
    const next = (draft.sources ?? []).map((s, i) =>
      i === idx ? { ...s, ...patch } : s,
    );
    setDraft({ ...draft, sources: next });
  }

  function removeSource(idx: number) {
    const next = (draft.sources ?? []).filter((_, i) => i !== idx);
    setDraft({ ...draft, sources: next });
  }

  function addSource() {
    setDraft({
      ...draft,
      sources: [...(draft.sources ?? []), { name: "", url: "" }],
    });
  }

  return (
    <>
      <h3
        style={{
          margin: 0,
          fontSize: 18,
          letterSpacing: "-0.02em",
          fontWeight: 600,
        }}
      >
        数据源
      </h3>
      <p style={{ margin: "4px 0 16px", color: "var(--ink-3)", fontSize: 13 }}>
        Preset 列表从远程拉取；远程不可用时自动切换为内置预设。
      </p>

      <div className="card" style={{ padding: 18, display: "grid", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingBottom: 12,
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <SectionLabel>当前状态</SectionLabel>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              border: "1px solid var(--hairline)",
              color:
                sourceMode === "remote" ? "var(--green)" : "var(--amber)",
              background:
                sourceMode === "remote"
                  ? "var(--green-soft)"
                  : "var(--amber-soft)",
            }}
          >
            {sourceMode === "remote" ? "远程" : "内置预设"}
          </span>
          {lastUpdated && (
            <span
              style={{
                fontSize: 11,
                color: "var(--ink-3)",
                marginLeft: "auto",
              }}
            >
              上次刷新 {lastUpdated.slice(0, 19).replace("T", " ")}
            </span>
          )}
        </div>

        {registryError && (
          <div
            style={{
              fontSize: 12,
              color: "var(--red)",
              background: "var(--red-soft)",
              border: "1px solid var(--hairline)",
              borderRadius: 8,
              padding: "8px 10px",
            }}
          >
            远程源不可用：
            {registryError.replace(/^ClaudePresetError:\s*/, "")}
          </div>
        )}

        <Field label="预设源地址">
          <TextInput
            value={draft.preset_source_url}
            onChange={(e) =>
              setDraft({ ...draft, preset_source_url: e.target.value })
            }
          />
        </Field>

        <Field label="缓存时效（分钟）" helper="远程索引和文件的缓存时长。">
          <TextInput
            type="number"
            value={String(draft.cache_ttl_minutes)}
            onChange={(e) =>
              setDraft({
                ...draft,
                cache_ttl_minutes: parseInt(e.target.value) || 60,
              })
            }
            style={{ width: 160 }}
          />
        </Field>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            size="sm"
            variant="secondary"
            disabled={refreshing}
            onClick={handleRefreshRegistry}
          >
            {refreshing ? "刷新中…" : "刷新远程源"}
          </Button>
          <Button
            size="sm"
            variant="subtle"
            onClick={() =>
              setDraft({ ...draft, preset_source_url: DEFAULT_SOURCE_URL })
            }
          >
            恢复默认源
          </Button>
        </div>
      </div>

      <div
        className="card"
        style={{ padding: 18, display: "grid", gap: 12, marginTop: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SectionLabel>额外数据源 · {draft.sources?.length ?? 0}</SectionLabel>
          <span style={{ flex: 1 }} />
          <Button size="sm" variant="subtle" onClick={addSource}>
            + 添加
          </Button>
        </div>

        {(draft.sources?.length ?? 0) === 0 ? (
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
            暂无额外数据源。
          </div>
        ) : (
          (draft.sources ?? []).map((s, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr auto",
                gap: 8,
                alignItems: "center",
              }}
            >
              <TextInput
                placeholder="名称"
                value={s.name}
                onChange={(e) => updateSource(idx, { name: e.target.value })}
              />
              <TextInput
                placeholder="URL"
                value={s.url}
                onChange={(e) => updateSource(idx, { url: e.target.value })}
              />
              <Button
                size="sm"
                variant="subtle"
                onClick={() => removeSource(idx)}
              >
                删除
              </Button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ── github ─────────────────────────────────────────────────────────────────
function GithubSection({
  draft,
  setDraft,
}: {
  draft: AppConfig;
  setDraft: (next: AppConfig) => void;
}) {
  return (
    <>
      <h3
        style={{
          margin: 0,
          fontSize: 18,
          letterSpacing: "-0.02em",
          fontWeight: 600,
        }}
      >
        GitHub
      </h3>
      <p style={{ margin: "4px 0 16px", color: "var(--ink-3)", fontSize: 13 }}>
        访问私有 registry 或提高 GitHub API 速率限制时使用。
      </p>
      <div className="card" style={{ padding: 18, display: "grid", gap: 16 }}>
        <Field
          label="GitHub Token"
          helper="可选。仅本地存储，不上传任何远端。"
        >
          <TextInput
            type="password"
            placeholder="ghp_…"
            value={draft.github_token ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                github_token: e.target.value || null,
              })
            }
          />
        </Field>
      </div>
    </>
  );
}

// ── about ──────────────────────────────────────────────────────────────────
function AboutSection() {
  const baselineExists = useConfigStore((s) => s.baselineExists);
  const captureBaseline = useConfigStore((s) => s.captureBaseline);
  const restoreBaseline = useConfigStore((s) => s.restoreBaseline);
  const addToast = useUiStore((s) => s.addToast);

  async function handleCapture() {
    try {
      await captureBaseline();
      addToast("基线已捕获", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function handleRestore() {
    try {
      await restoreBaseline();
      addToast("已恢复基线", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  return (
    <>
      <h3
        style={{
          margin: 0,
          fontSize: 18,
          letterSpacing: "-0.02em",
          fontWeight: 600,
        }}
      >
        关于
      </h3>
      <p style={{ margin: "4px 0 16px", color: "var(--ink-3)", fontSize: 13 }}>
        基线快照与版本信息。
      </p>
      <div className="card" style={{ padding: 18, display: "grid", gap: 16 }}>
        <Field
          label="基线快照"
          helper="记录当前 ~/.claude/ 状态，安装 preset 出问题时可一键还原。"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: baselineExists ? "var(--green)" : "var(--ink-3)",
              }}
            />
            <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
              {baselineExists ? "已捕获" : "未捕获"}
            </span>
            <span style={{ flex: 1 }} />
            <Button
              size="sm"
              variant="secondary"
              disabled={baselineExists}
              onClick={handleCapture}
            >
              捕获快照
            </Button>
            <Button
              size="sm"
              variant="subtle"
              disabled={!baselineExists}
              onClick={handleRestore}
            >
              恢复快照
            </Button>
          </div>
        </Field>
      </div>
    </>
  );
}

// ── page ───────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const config = useConfigStore((s) => s.config);
  const load = useConfigStore((s) => s.load);
  const saveConfig = useConfigStore((s) => s.save);
  const addToast = useUiStore((s) => s.addToast);

  const [draft, setDraft] = useState<AppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("appearance");
  const isPreview = !isTauriApp();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (config && !draft) setDraft(config);
  }, [config, draft]);

  const dirty = useMemo(
    () =>
      !!config && !!draft && JSON.stringify(config) !== JSON.stringify(draft),
    [config, draft],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { threshold: [0.4], rootMargin: "-100px 0px -50% 0px" },
    );
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      await saveConfig(draft);
      addToast("已保存", "success");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (config) setDraft(config);
  }

  return (
    <>
      <Topbar
        title="设置"
        actions={
          <>
            <Button variant="subtle" disabled={!dirty} onClick={discard}>
              Discard
            </Button>
            <Button
              variant="primary"
              disabled={!dirty || saving}
              onClick={save}
            >
              {saving ? "保存中…" : "Save changes"}
            </Button>
          </>
        }
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <nav
          style={{
            borderRight: "1px solid var(--hairline)",
            padding: "22px 14px",
            overflow: "auto",
          }}
        >
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(id)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                display: "block",
                padding: "8px 10px",
                fontSize: 13,
                borderRadius: 6,
                color: activeSection === id ? "var(--ink)" : "var(--ink-2)",
                background:
                  activeSection === id ? "var(--card)" : "transparent",
                fontWeight: activeSection === id ? 600 : 500,
                marginBottom: 2,
                textDecoration: "none",
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div style={{ padding: "22px 28px", overflow: "auto" }}>
          {isPreview && (
            <div
              style={{
                marginBottom: 18,
                padding: "8px 12px",
                fontSize: 12,
                color: "var(--amber)",
                background: "var(--amber-soft)",
                border: "1px solid var(--hairline)",
                borderRadius: 8,
              }}
            >
              预览模式 · 配置更改不会持久化
            </div>
          )}

          {!draft ? (
            <div style={{ color: "var(--ink-3)", fontSize: 13 }}>加载中…</div>
          ) : (
            <div style={{ maxWidth: 720, display: "grid", gap: 24 }}>
              <section id="appearance">
                <AppearanceSection />
              </section>
              <section id="sources">
                <SourcesSection draft={draft} setDraft={setDraft} />
              </section>
              <section id="github">
                <GithubSection draft={draft} setDraft={setDraft} />
              </section>
              <section id="about">
                <AboutSection />
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
