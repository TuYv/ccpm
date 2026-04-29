import { useState } from "react";
import { api } from "../api/claudePreset";
import { useUiStore } from "../stores";
import type { ImportedBundle } from "../types/core";
import { Button, SectionLabel, TextInput } from "./ui";

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
    <div className="flex items-center gap-2 bg-card border border-hairline rounded-control px-3 py-2 focus-within:border-accent transition-colors">
      <span className="text-ink-3 text-xs">GH</span>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading) handleImport();
        }}
        placeholder="GitHub URL（如 https://github.com/owner/repo）"
        className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
        disabled={loading}
      />
      <Button variant="primary" size="sm" onClick={handleImport} disabled={loading}>
        {loading ? "导入中…" : "导入"}
      </Button>
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
    <div className="modal-shell" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div
        className="modal"
        style={{ width: 560, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div className="modal-head">
          <SectionLabel style={{ display: "block", marginBottom: 6 }}>Import preset</SectionLabel>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>从 GitHub 导入</h3>
          <div
            className="text-xs text-ink-3"
            style={{ marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {bundle.source_repo}
          </div>
        </div>

        <div className="modal-body" style={{ flex: 1, overflow: "auto" }}>
          <div className="space-y-4">
            <div>
              <SectionLabel style={{ display: "block", marginBottom: 8 }}>名称</SectionLabel>
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="预设名称"
              />
              <div className="text-xs text-ink-3" style={{ marginTop: 6 }}>
                ID: <span className="font-mono">{bundle.suggested_id}</span>
              </div>
            </div>

            <div>
              <SectionLabel style={{ display: "block", marginBottom: 8 }}>将导入内容</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {bundle.claude_md && (
                  <div className="bg-card-2 rounded-control" style={{ padding: "8px 12px" }}>
                    <span className="font-mono text-xs text-ink">CLAUDE.md</span>
                  </div>
                )}
                {bundle.settings_json && (
                  <div className="bg-card-2 rounded-control" style={{ padding: "8px 12px" }}>
                    <span className="font-mono text-xs text-ink">settings.json</span>
                  </div>
                )}
                {skillCount > 0 && (
                  <div className="bg-card-2 rounded-control" style={{ padding: "8px 12px" }}>
                    <span className="text-xs text-ink">
                      {skillCount} skill{skillCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {mcpCount > 0 && (
                  <div className="bg-card-2 rounded-control" style={{ padding: "8px 12px" }}>
                    <span className="text-xs text-ink">
                      {mcpCount} MCP{mcpCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {!bundle.claude_md && !bundle.settings_json && skillCount === 0 && mcpCount === 0 && (
                  <div className="text-xs text-ink-3">仓库中未发现可导入的内容</div>
                )}
              </div>
            </div>

            <div className="text-xs text-ink-3">
              来源：
              <a
                href={bundle.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline ml-1 break-all"
              >
                {bundle.source_url}
              </a>
            </div>

            {isEmpty && (
              <div className="text-xs text-red">未发现可导入的 CLAUDE.md 或 settings.json</div>
            )}
          </div>
        </div>

        <div className="modal-foot">
          <Button variant="subtle" onClick={onCancel} disabled={saving}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !name.trim() || isEmpty}
          >
            {saving ? "保存中…" : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
