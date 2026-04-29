import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { api } from "../api/claudePreset";
import Topbar from "../components/Topbar";
import { Button, Chip, EmptyState, SectionLabel } from "../components/ui";
import { useBackupsStore, useUiStore } from "../stores";
import type { BackupEntry } from "../types/core";

function scopeLabel(scope: string): string {
  return scope === "global" ? "全局" : "项目";
}

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: zhCN });
  } catch {
    return iso;
  }
}

function groupByScope(entries: BackupEntry[]): { scope: string; items: BackupEntry[] }[] {
  const map = new Map<string, BackupEntry[]>();
  for (const e of entries) {
    const key = e.scope;
    const arr = map.get(key) ?? [];
    arr.push(e);
    map.set(key, arr);
  }
  // sort items inside each group by created_at desc
  for (const arr of map.values()) {
    arr.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
  // global first, then projects alphabetical
  const keys = Array.from(map.keys()).sort((a, b) => {
    if (a === "global") return -1;
    if (b === "global") return 1;
    return a.localeCompare(b);
  });
  return keys.map((scope) => ({ scope, items: map.get(scope)! }));
}

export default function BackupsPage() {
  const { entries, load } = useBackupsStore();
  const { addToast } = useUiStore();
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => groupByScope(entries), [entries]);

  async function handleRestore(id: string) {
    if (!confirm("从该备份恢复？此操作会覆盖当前文件。")) return;
    setBusy(id);
    try {
      await api.restoreBackup(id);
      addToast(`已从备份 ${id.slice(0, 8)}… 恢复`, "success");
      await load();
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setBusy(null);
    }
  }

  function handleViewFiles() {
    addToast("查看文件功能尚未实现", "error");
  }

  function handleDelete() {
    addToast("删除备份功能尚未实现", "error");
  }

  return (
    <>
      <Topbar title="备份" crumb={`${entries.length} 项`} />

      <div
        className="content"
        style={{ display: "grid", gap: 18, gridTemplateColumns: "1fr" }}
      >
        {entries.length === 0 ? (
          <EmptyState
            title="暂无备份"
            description="安装或激活时，自动生成的备份会显示在这里。"
          />
        ) : (
          groups.map((g) => (
            <section key={g.scope} style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SectionLabel>{scopeLabel(g.scope)} · {g.items.length}</SectionLabel>
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--ink-3)" }}
                >
                  {g.scope === "global" ? "~/.claude/" : g.scope}
                </span>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                {g.items.map((e) => (
                  <div
                    key={e.id}
                    className="row"
                    style={{
                      gridTemplateColumns: "auto 1fr auto",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "var(--card-2)",
                        border: "1px solid var(--hairline)",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--ink-2)",
                      }}
                      aria-hidden
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="12" height="3.5" rx="1" />
                        <rect x="2.8" y="6.5" width="10.4" height="6.5" rx="1" />
                        <path d="M6.5 9h3" />
                      </svg>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          className="mono"
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: "var(--ink)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 360,
                          }}
                          title={e.scope === "global" ? "~/.claude/" : e.scope}
                        >
                          {e.scope === "global" ? "~/.claude/" : e.scope}
                        </span>
                        <Chip>
                          {e.previous_preset
                            ? `from ${e.previous_preset}`
                            : "无来源"}
                        </Chip>
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--ink-3)",
                          marginTop: 3,
                          display: "flex",
                          gap: 10,
                        }}
                      >
                        <span>{relativeTime(e.created_at)}</span>
                        <span>·</span>
                        <span>{e.files.length} 个文件</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={busy === e.id}
                        onClick={() => handleRestore(e.id)}
                      >
                        {busy === e.id ? "恢复中…" : "恢复"}
                      </Button>
                      <Button size="sm" variant="subtle" onClick={handleViewFiles}>
                        查看文件
                      </Button>
                      <Button size="sm" variant="danger" onClick={handleDelete}>
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
