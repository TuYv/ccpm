import { useState } from "react";
import type { PresetManifest, ScopeArg } from "../types/core";
import { Button, SectionLabel, TextInput } from "./ui";

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
    <div className="modal-shell" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div
        className="modal"
        style={{ width: 720, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div className="modal-head">
          <SectionLabel style={{ display: "block", marginBottom: 6 }}>Selective install</SectionLabel>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{manifest.name}</h3>
          <div className="text-xs text-ink-3" style={{ marginTop: 6 }}>
            目标：{scope.kind === "global" ? "全局 ~/.claude/" : `项目 ${scope.path}`}
          </div>
        </div>

        <div className="modal-body" style={{ flex: 1, overflow: "auto" }}>
          {isEmpty ? (
            <div className="text-center text-ink-3 text-sm" style={{ padding: "32px 0" }}>
              此预设无可选内容
            </div>
          ) : (
            <div className="space-y-5">
              {Object.keys(manifest.files).length > 0 && (
                <div>
                  <SectionLabel style={{ display: "block", marginBottom: 8 }}>Files</SectionLabel>
                  <div
                    className="bg-card-2 rounded-control"
                    style={{ padding: "10px 12px" }}
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={files.includeAll}
                        onChange={(e) => setFiles({ includeAll: e.target.checked })}
                      />
                      <span className="text-xs text-ink font-mono">
                        包含全部文件 ({Object.keys(manifest.files).length})
                      </span>
                    </label>
                    <div className="text-[10px] text-ink-3" style={{ marginTop: 6, marginLeft: 24 }}>
                      v1 仅支持「全部」或「不安装」文件；选择性按 skill / MCP 进行
                    </div>
                  </div>
                </div>
              )}

              {(manifest.skills ?? []).length > 0 && (
                <div>
                  <SectionLabel style={{ display: "block", marginBottom: 8 }}>Skills</SectionLabel>
                  <div>
                    {(manifest.skills ?? []).map((id) => (
                      <label key={id} className="row" style={{ cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={skills[id] ?? false}
                          onChange={(e) => setSkills((p) => ({ ...p, [id]: e.target.checked }))}
                        />
                        <span className="name" style={{ marginLeft: 8 }}>{id}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(manifest.mcps ?? []).length > 0 && (
                <div>
                  <SectionLabel style={{ display: "block", marginBottom: 8 }}>MCPs</SectionLabel>
                  <div>
                    {(manifest.mcps ?? []).map((m) => {
                      const state = mcps[m.ref];
                      return (
                        <div key={m.ref} style={{ marginBottom: 8 }}>
                          <label className="row" style={{ cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={state.selected}
                              onChange={(e) =>
                                setMcps((p) => ({
                                  ...p,
                                  [m.ref]: { ...p[m.ref], selected: e.target.checked },
                                }))
                              }
                            />
                            <span className="name" style={{ marginLeft: 8 }}>{m.ref}</span>
                          </label>
                          {state.selected && (m.required_env ?? []).length > 0 && (
                            <div style={{ marginTop: 8, marginLeft: 24, display: "flex", flexDirection: "column", gap: 6 }}>
                              {(m.required_env ?? []).map((k) => (
                                <div key={k} className="flex gap-2 items-center">
                                  <span className="text-[10px] font-mono text-ink-3" style={{ width: 120, flexShrink: 0 }}>
                                    {k}
                                  </span>
                                  <TextInput
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
                                    style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 12 }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <Button variant="subtle" onClick={onCancel}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm({ files, skills, mcps })}
            disabled={isEmpty}
          >
            安装
          </Button>
        </div>
      </div>
    </div>
  );
}
