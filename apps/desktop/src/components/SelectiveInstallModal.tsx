import { useState } from "react";
import type { PresetManifest, ScopeArg } from "../types/core";

interface Selection {
  files: Record<string, boolean>;
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
  const [files, setFiles] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(manifest.files).map((k) => [k, true])),
  );
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
          {Object.keys(manifest.files).length > 0 && (
            <div>
              <div className="text-xs text-app-secondary mb-2">文件</div>
              <div className="space-y-1.5">
                {Object.keys(manifest.files).map((name) => (
                  <label key={name} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={files[name] ?? false}
                      onChange={(e) => setFiles((p) => ({ ...p, [name]: e.target.checked }))}
                      className="accent-app-accent"
                    />
                    <span className="text-xs text-app-text">{name}</span>
                  </label>
                ))}
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
            className="px-4 py-1.5 text-xs bg-app-accent rounded-lg text-white hover:bg-app-accentHover transition-colors"
          >
            确认安装
          </button>
        </div>
      </div>
    </div>
  );
}
