import { useEffect, useState } from "react";
import { api } from "../api/claudePreset";
import { Avatar, Card } from "../components/ui";
import { useInstalledStore, useUiStore } from "../stores";
import type { RestoreArg, ScopeArg } from "../types/core";

function UninstallModal({
  scope,
  onConfirm,
  onCancel,
}: {
  scope: ScopeArg;
  onConfirm: (r: RestoreArg) => void;
  onCancel: () => void;
}) {
  const [restore, setRestore] = useState<RestoreArg>("lastbackup");
  const options: [RestoreArg, string][] =
    scope.kind === "global"
      ? [
          ["lastbackup", "恢复上一个备份"],
          ["baseline", "恢复基线"],
          ["keepfiles", "保留文件不还原"],
        ]
      : [
          ["lastbackup", "恢复上一个备份"],
          ["keepfiles", "保留文件不还原"],
        ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
      <div className="bg-app-card border border-app-border rounded-2xl p-6 w-80 shadow-2xl">
        <h2 className="text-base font-semibold text-app-text mb-4">卸载 preset</h2>
        <div className="space-y-2.5 mb-6">
          {options.map(([val, label]) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  restore === val
                    ? "border-app-accent bg-app-accent"
                    : "border-app-border group-hover:border-app-accent/50"
                }`}
                onClick={() => setRestore(val)}
              >
                {restore === val && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <span className="text-sm text-app-secondary">{label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-app-secondary hover:text-app-text transition-colors rounded-lg hover:bg-app-cardHover"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(restore)}
            className="px-4 py-2 text-sm bg-app-red hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            确认卸载
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InstalledPage() {
  const { state, load } = useInstalledStore();
  const { addToast } = useUiStore();
  const [pending, setPending] = useState<ScopeArg | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  async function uninstall(scope: ScopeArg, restore: RestoreArg) {
    setPending(null);
    try {
      await api.deactivatePreset(scope, restore);
      addToast("✓ 已卸载", "success");
      await load();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      {pending && (
        <UninstallModal
          scope={pending}
          onConfirm={(r) => uninstall(pending, r)}
          onCancel={() => setPending(null)}
        />
      )}

      <h1 className="text-lg font-bold text-app-text mb-6">已安装</h1>

      {/* Global */}
      <section className="mb-6">
        <div className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-3">
          全局 · ~/.claude/
        </div>
        {state?.global ? (
          <Card>
            <div className="px-5 py-4">
              <div className="flex items-center gap-4">
                <Avatar name={state.global.active_preset_id} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-app-text">
                    {state.global.active_preset_id}
                  </div>
                  <div className="text-xs text-app-muted mt-0.5">
                    v{state.global.preset_version} · 激活于 {state.global.activated_at.slice(0, 10)}
                  </div>
                </div>
                <button
                  onClick={() => setPending({ kind: "global" })}
                  className="px-3 py-1.5 text-xs bg-app-red/10 hover:bg-app-red text-app-red hover:text-white border border-app-red/30 hover:border-app-red rounded-lg transition-colors"
                >
                  卸载
                </button>
              </div>
              {state?.global_skills && state.global_skills.length > 0 && (
                <div className="mt-3 pt-3 border-t border-app-border/40">
                  <div className="text-[10px] uppercase text-app-muted mb-1.5">已安装 Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {state.global_skills.map((id) => (
                      <span key={id} className="px-2 py-0.5 text-[11px] rounded-full bg-app-accent/10 text-app-accent border border-app-accent/20 font-mono">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {state?.global_mcps && state.global_mcps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-app-border/40">
                  <div className="text-[10px] uppercase text-app-muted mb-1.5">已安装 MCPs</div>
                  <div className="flex flex-wrap gap-1.5">
                    {state.global_mcps.map((id) => (
                      <span key={id} className="px-2 py-0.5 text-[11px] rounded-full bg-app-green/10 text-app-green border border-app-green/20 font-mono">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="text-sm text-app-muted py-2">未激活</div>
        )}
      </section>

      {/* Projects */}
      <section>
        <div className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-3">
          项目
        </div>
        {Object.entries(state?.projects ?? {}).length === 0 ? (
          <div className="text-sm text-app-muted py-2">无项目级激活</div>
        ) : (
          <div className="space-y-2">
            {Object.entries(state?.projects ?? {}).map(([path, info]) => (
              <Card key={path}>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar name={info.active_preset_id} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-app-text">
                        {info.active_preset_id}
                      </div>
                      <div className="text-xs text-app-link font-mono mt-0.5 truncate">
                        {path}
                      </div>
                    </div>
                    <button
                      onClick={() => setPending({ kind: "project", path })}
                      className="px-3 py-1.5 text-xs bg-app-red/10 hover:bg-app-red text-app-red hover:text-white border border-app-red/30 hover:border-app-red rounded-lg transition-colors"
                    >
                      卸载
                    </button>
                  </div>
                  {state?.project_skills?.[path] && state.project_skills[path].length > 0 && (
                    <div className="mt-3 pt-3 border-t border-app-border/40">
                      <div className="text-[10px] uppercase text-app-muted mb-1.5">已安装 Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {state.project_skills[path].map((id) => (
                          <span key={id} className="px-2 py-0.5 text-[11px] rounded-full bg-app-accent/10 text-app-accent border border-app-accent/20 font-mono">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {state?.project_mcps?.[path] && state.project_mcps[path].length > 0 && (
                    <div className="mt-3 pt-3 border-t border-app-border/40">
                      <div className="text-[10px] uppercase text-app-muted mb-1.5">已安装 MCPs</div>
                      <div className="flex flex-wrap gap-1.5">
                        {state.project_mcps[path].map((id) => (
                          <span key={id} className="px-2 py-0.5 text-[11px] rounded-full bg-app-green/10 text-app-green border border-app-green/20 font-mono">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
