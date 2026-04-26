import { useState } from "react";
import { api } from "../api/claudePreset";
import { useUiStore } from "../stores";
import type { ImportedBundle } from "../types/core";

interface GithubImportInputProps {
  onImported: (bundle: ImportedBundle) => void;
}

export default function GithubImportInput({ onImported }: GithubImportInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useUiStore();

  async function handleImport() {
    const trimmed = url.trim();
    if (!trimmed) {
      addToast("请输入 GitHub 仓库 URL", "error");
      return;
    }
    setLoading(true);
    try {
      const bundle = await api.importFromGithub(trimmed);
      onImported(bundle);
      setUrl("");
    } catch (e) {
      addToast(`抓取失败：${String(e)}`, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 bg-app-card rounded-lg px-3 py-2 border border-app-border focus-within:border-app-accent transition-colors">
      <span className="text-app-muted text-xs">🐙</span>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading) handleImport();
        }}
        placeholder="GitHub URL（如 https://github.com/owner/repo）"
        className="flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-app-muted"
        disabled={loading}
      />
      <button
        onClick={handleImport}
        disabled={loading}
        className="px-3 py-1 text-xs bg-app-accent hover:bg-app-accentHover disabled:opacity-50 text-white rounded-md transition-colors"
      >
        {loading ? "导入中…" : "导入"}
      </button>
    </div>
  );
}

interface ImportPreviewModalProps {
  bundle: ImportedBundle;
  onCancel: () => void;
  onConfirm: (name: string) => void | Promise<void>;
}

export function ImportPreviewModal({ bundle, onCancel, onConfirm }: ImportPreviewModalProps) {
  const [name, setName] = useState(bundle.suggested_name);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onConfirm(trimmed);
    } finally {
      setSaving(false);
    }
  }

  const skillCount = Object.keys(bundle.skills).length;
  const mcpCount = Object.keys(bundle.mcps).length;
  const isEmpty = !bundle.claude_md && !bundle.settings_json;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="bg-app-card border border-app-border rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-app-border">
          <h2 className="text-base font-semibold text-app-text">从 GitHub 导入预设</h2>
          <div className="text-xs text-app-muted mt-1 truncate">{bundle.source_repo}</div>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-app-muted uppercase tracking-wider mb-2">
              名称
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="预设名称"
              className="w-full bg-app-surface border border-app-border focus:border-app-accent rounded-lg px-3 py-2 text-sm text-app-text outline-none transition-colors"
            />
            <div className="text-xs text-app-muted mt-1">ID: {bundle.suggested_id}</div>
          </div>

          <div>
            <div className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-2">
              将导入内容
            </div>
            <ul className="space-y-1.5 text-sm">
              {bundle.claude_md && (
                <li className="flex items-center gap-2 text-app-text">
                  <span>📄</span>
                  <span className="font-mono text-xs">CLAUDE.md</span>
                </li>
              )}
              {bundle.settings_json && (
                <li className="flex items-center gap-2 text-app-text">
                  <span>⚙️</span>
                  <span className="font-mono text-xs">settings.json</span>
                </li>
              )}
              {skillCount > 0 && (
                <li className="flex items-center gap-2 text-app-text">
                  <span>⚡</span>
                  <span className="text-xs">{skillCount} skill{skillCount > 1 ? "s" : ""}</span>
                </li>
              )}
              {mcpCount > 0 && (
                <li className="flex items-center gap-2 text-app-text">
                  <span>🔌</span>
                  <span className="text-xs">{mcpCount} MCP{mcpCount > 1 ? "s" : ""}</span>
                </li>
              )}
              {!bundle.claude_md && !bundle.settings_json && skillCount === 0 && mcpCount === 0 && (
                <li className="text-xs text-app-muted">仓库中未发现可导入的内容</li>
              )}
            </ul>
          </div>

          <div className="text-xs text-app-muted">
            来源：
            <a
              href={bundle.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-app-accent hover:underline ml-1 break-all"
            >
              {bundle.source_url}
            </a>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-app-border flex flex-col gap-2">
          {isEmpty && (
            <div className="text-xs text-app-red">未发现可导入的 CLAUDE.md 或 settings.json</div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-1.5 text-sm bg-app-surface border border-app-border rounded-lg text-app-secondary hover:bg-app-cardHover disabled:opacity-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim() || isEmpty}
              className="px-5 py-1.5 text-sm bg-app-accent hover:bg-app-accentHover disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
