import { useEffect, useState } from "react";
import { api } from "../api/claudePreset";
import { Card } from "../components/ui";
import { useBackupsStore, useUiStore } from "../stores";

function scopeLabel(scope: string) {
  return scope === "global" ? "全局" : "项目";
}

function restoreTarget(scope: string) {
  return scope === "global" ? "~/.claude/" : scope;
}

function dateColor(scope: string): string {
  const colors = ["#0a84ff", "#af52de", "#ff9500", "#34c759", "#ff375f"];
  let h = 0;
  for (const c of scope) h = (((h << 5) - h) + c.charCodeAt(0)) >>> 0;
  return colors[h % colors.length];
}

export default function BackupsPage() {
  const { entries, load } = useBackupsStore();
  const { addToast } = useUiStore();
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRestore(id: string) {
    setRestoring(id);
    try {
      await api.restoreBackup(id);
      addToast(`✓ 已从备份 ${id.slice(0, 8)}… 恢复`, "success");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setRestoring(null);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-bold text-app-text mb-6">备份历史</h1>

      {entries.length === 0 ? (
        <div className="text-sm text-app-muted py-2">暂无备份</div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <Card key={e.id}>
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Date avatar */}
                <div
                  style={{ backgroundColor: dateColor(e.scope), flexShrink: 0, width: 40, height: 40 }}
                  className="rounded-full flex items-center justify-center text-white text-xs font-bold select-none"
                >
                  {e.created_at.slice(8, 10)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        e.scope === "global"
                          ? "bg-app-accent/10 text-app-accent border-app-accent/20"
                          : "bg-purple-900/20 text-purple-300 border-purple-800/30"
                      }`}
                    >
                      {scopeLabel(e.scope)}
                    </span>
                    <span className="text-xs text-app-muted">
                      {e.created_at.slice(0, 10)}
                    </span>
                  </div>
                  <div className="text-xs text-app-muted font-mono mt-1.5 truncate">
                    {restoreTarget(e.scope)}
                  </div>
                  <div className="text-xs text-app-secondary mt-0.5">
                    {e.previous_preset ? `← ${e.previous_preset}` : "首次安装前备份"}
                  </div>
                </div>

                {/* Restore */}
                <button
                  onClick={() => handleRestore(e.id)}
                  disabled={restoring === e.id}
                  className="px-3 py-1.5 text-xs bg-app-card hover:bg-app-cardHover disabled:opacity-50 text-app-secondary hover:text-app-text border border-app-border rounded-lg transition-colors"
                >
                  {restoring === e.id ? "恢复中…" : "恢复"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
