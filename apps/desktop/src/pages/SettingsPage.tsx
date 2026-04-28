import { useEffect, useState } from "react";
import { isTauriApp } from "../api/claudePreset";
import { useConfigStore, usePresetsStore, useUiStore } from "../stores";
import type { AppConfig } from "../types/core";

const DEFAULT_SOURCE_URL =
  "https://raw.githubusercontent.com/TuYv/ccpm/main/preset-registry";

function SectionCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3">
        <div className="text-base font-semibold text-app-text">{title}</div>
        {subtitle && <div className="text-xs text-app-muted mt-0.5">{subtitle}</div>}
      </div>
      <div className="bg-app-card border border-app-border rounded-xl p-5">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { config, baselineExists, load, save, captureBaseline, restoreBaseline } =
    useConfigStore();
  const { sourceMode, lastUpdated, error: registryError, fetchIndex } = usePresetsStore();
  const { addToast } = useUiStore();
  const [draft, setDraft] = useState<AppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isPreview = !isTauriApp();

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (config) setDraft(config); }, [config]);

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    try {
      await save(draft);
      addToast("✓ 配置已保存", "success");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRefreshRegistry() {
    setRefreshing(true);
    try {
      await fetchIndex(true);
      const mode = usePresetsStore.getState().sourceMode;
      if (mode === "remote") {
        addToast("✓ 远程源已刷新", "success");
      } else {
        addToast("远程源不可用，已使用内置预设", "error");
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCapture() {
    try {
      await captureBaseline();
      addToast("✓ 基线已捕获", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function handleRestore() {
    try {
      await restoreBaseline();
      addToast("✓ 已恢复基线", "success");
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  if (!draft) {
    return <div className="p-6 text-app-muted text-sm">加载中…</div>;
  }

  return (
    <div className="p-6 max-w-xl space-y-8">
      {isPreview && (
        <div className="px-4 py-3 bg-orange-900/20 border border-orange-800/40 rounded-xl text-xs text-orange-300">
          预览模式 · 配置更改不会持久化
        </div>
      )}

      {/* 数据源配置 */}
      <SectionCard
        title="数据源配置"
        subtitle="Preset 列表从远程拉取；远程不可用时自动切换为内置预设"
      >
        <div className="space-y-5">
          {/* 当前状态行 */}
          <div className="flex items-center gap-3 pb-4 border-b border-app-border">
            <span className="text-sm text-app-secondary">当前状态</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border ${
                sourceMode === "remote"
                  ? "bg-app-green/10 text-app-green border-app-green/20"
                  : "bg-yellow-900/20 text-yellow-300 border-yellow-800/30"
              }`}
            >
              {sourceMode === "remote" ? "远程" : "内置预设"}
            </span>
            {lastUpdated && (
              <span className="text-xs text-app-muted ml-auto">
                上次刷新 {lastUpdated.slice(0, 19).replace("T", " ")}
              </span>
            )}
          </div>

          {registryError && (
            <div className="text-xs text-app-red/80 bg-app-red/5 border border-app-red/20 rounded-lg px-3 py-2">
              远程源不可用：{registryError.replace(/^ClaudePresetError:\s*/, "")}
            </div>
          )}

          {/* URL */}
          <div>
            <label className="block text-xs text-app-muted mb-1.5">预设源地址</label>
            <input
              value={draft.preset_source_url}
              onChange={(e) => setDraft({ ...draft, preset_source_url: e.target.value })}
              className="w-full bg-app-surface text-sm text-app-text px-3 py-2.5 rounded-lg border border-app-border focus:border-app-accent outline-none transition-colors"
            />
          </div>

          {/* GitHub Token */}
          <div>
            <label className="block text-xs text-app-muted mb-1.5">
              GitHub Token（可选，用于私有注册表）
            </label>
            <input
              type="password"
              value={draft.github_token ?? ""}
              onChange={(e) => setDraft({ ...draft, github_token: e.target.value || null })}
              className="w-full bg-app-surface text-sm text-app-text px-3 py-2.5 rounded-lg border border-app-border focus:border-app-accent outline-none transition-colors"
            />
          </div>

          {/* Cache TTL */}
          <div>
            <label className="block text-xs text-app-muted mb-1.5">缓存时效（分钟）</label>
            <input
              type="number"
              value={draft.cache_ttl_minutes}
              onChange={(e) =>
                setDraft({ ...draft, cache_ttl_minutes: parseInt(e.target.value) || 60 })
              }
              className="w-28 bg-app-surface text-sm text-app-text px-3 py-2.5 rounded-lg border border-app-border focus:border-app-accent outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-app-accent hover:bg-app-accentHover disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? "保存中…" : "保存配置"}
            </button>
            <button
              onClick={handleRefreshRegistry}
              disabled={refreshing}
              className="px-4 py-2 text-sm bg-app-surface hover:bg-app-cardHover disabled:opacity-50 text-app-secondary hover:text-app-text border border-app-border rounded-lg transition-colors"
            >
              {refreshing ? "刷新中…" : "刷新远程源"}
            </button>
            <button
              onClick={() => setDraft({ ...draft, preset_source_url: DEFAULT_SOURCE_URL })}
              className="px-4 py-2 text-sm bg-app-surface hover:bg-app-cardHover text-app-secondary hover:text-app-text border border-app-border rounded-lg transition-colors"
            >
              恢复默认源
            </button>
          </div>
        </div>
      </SectionCard>

      {/* 基线 */}
      <SectionCard
        title="基线快照"
        subtitle="记录当前 ~/.claude/ 的状态，安装 preset 出问题时可一键还原"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${baselineExists ? "bg-app-green" : "bg-app-muted"}`}
            />
            <span className="text-sm text-app-secondary">
              {baselineExists ? "已捕获" : "未捕获"}
            </span>
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleCapture}
              disabled={baselineExists}
              className="px-4 py-2 text-sm bg-app-surface hover:bg-app-cardHover disabled:opacity-40 text-app-secondary hover:text-app-text border border-app-border rounded-lg transition-colors"
            >
              捕获快照
            </button>
            <button
              onClick={handleRestore}
              disabled={!baselineExists}
              className="px-4 py-2 text-sm bg-app-surface hover:bg-app-cardHover disabled:opacity-40 text-app-secondary hover:text-app-text border border-app-border rounded-lg transition-colors"
            >
              恢复快照
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
