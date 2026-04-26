import { useState } from "react";
import type { PresetManifest, ScopeArg } from "../types/core";

interface Selection {
  files: { includeAll: boolean };
  skills: Record<string, boolean>;
  mcps: Record<string, { selected: boolean; env: Record<string, string> }>;
}

export interface SelectiveInstallProps {
  manifest: PresetManifest;
  scope: ScopeArg;
  onCancel: () => void;
  onConfirm: (selection: Selection) => void;
}

export default function SelectiveInstallModal({
  manifest,
  scope,
  onCancel,
  onConfirm,
}: SelectiveInstallProps) {
  const [files, setFiles] = useState<{ includeAll: boolean }>({ includeAll: true });
  const [skills, setSkills] = useState<Record<string, boolean>>(
    Object.fromEntries((manifest.skills ?? []).map((id) => [id, true])),
  );
  const [mcps, setMcps] = useState<Record<string, { selected: boolean; env: Record<string, string> }>>(
    Object.fromEntries(
      (manifest.mcps ?? []).map((m) => [
        m.ref,
        { selected: false, env: Object.fromEntries((m.required_env ?? []).map((k) => [k, ""])) },
      ]),
    ),
  );

  const isEmpty =
    Object.keys(manifest.files).length === 0 &&
    (manifest.skills?.length ?? 0) === 0 &&
    (manifest.mcps?.length ?? 0) === 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-app-bg border border-app-border rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-app-border">
          <div className="text-sm font-semibold text-app-text">选择性安装 — {manifest.name}</div>
          <div className="text-xs text-app-muted mt-1">
            目标：{scope.kind === "global" ? "全局 ~/.claude/" : `项目 ${scope.path}`}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isEmpty ? (
            <div className="text-center text-app-muted text-sm py-8">
              此预设无可选内容
            </div>
          ) : (
            <>
              {Object.keys(manifest.files).length > 0 && (
                <div>
                  <div className="text-xs text-app-secondary mb-2">文件</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={files.includeAll}
                      onChange={(e) => setFiles({ includeAll: e.target.checked })}
                      className="accent-app-accent"
                    />
                    <span className="text-xs text-app-text">
                      包含全部文件 ({Object.keys(manifest.files).length})
                    </span>
                  </label>
                  <div className="text-[10px] text-app-muted mt-1 ml-6">
                    v1 仅支持「全部」或「不安装」文件；选择性按 skill / MCP 进行
                  </div>
                </div>
              )}

              {(manifest.skills ?? []).length > 0 && (
                <div>
                  <div className="text-xs text-app-secondary mb-2">Skills</div>
                  <div className="space-y-1.5">
                    {(manifest.skills ?? []).map((id) => (
                      <label key={id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={skills[id] ?? false}
                          onChange={(e) => setSkills((p) => ({ ...p, [id]: e.target.checked }))}
                          className="accent-app-accent"
                        />
                        <span className="text-xs text-app-text">{id}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(manifest.mcps ?? []).length > 0 && (
                <div>
                  <div className="text-xs text-app-secondary mb-2">MCPs</div>
                  <div className="space-y-3">
                    {(manifest.mcps ?? []).map((m) => {
                      const state = mcps[m.ref];
                      return (
                        <div key={m.ref} className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={state.selected}
                              onChange={(e) =>
                                setMcps((p) => ({
                                  ...p,
                                  [m.ref]: { ...p[m.ref], selected: e.target.checked },
                                }))
                              }
                              className="accent-app-accent"
                            />
                            <span className="text-xs text-app-text">{m.ref}</span>
                          </label>
                          {state.selected &&
                            (m.required_env ?? []).map((k) => (
                              <div key={k} className="flex gap-2 ml-6">
                                <span className="text-[10px] font-mono text-app-muted w-28 shrink-0 self-center">
                                  {k}
                                </span>
                                <input
                                  value={state.env[k] ?? ""}
                                  onChange={(e) =>
                                    setMcps((p) => ({
                                      ...p,
                                      [m.ref]: {
                                        ...p[m.ref],
                                        env: { ...p[m.ref].env, [k]: e.target.value },
                                      },
                                    }))
                                  }
                                  className="flex-1 bg-app-surface text-[11px] text-app-text px-2 py-1 rounded border border-app-border focus:border-app-accent outline-none font-mono"
                                />
                              </div>
                            ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-app-border flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-xs bg-app-surface border border-app-border rounded-lg text-app-secondary hover:bg-app-cardHover transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm({ files, skills, mcps })}
            disabled={isEmpty}
            className="px-4 py-1.5 text-xs bg-app-accent rounded-lg text-white hover:bg-app-accentHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            确认安装
          </button>
        </div>
      </div>
    </div>
  );
}
