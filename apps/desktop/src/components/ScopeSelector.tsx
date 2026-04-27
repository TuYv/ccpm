import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useRef, useState } from "react";
import { api, isTauriApp } from "../api/claudePreset";
import type { ScopeArg } from "../types/core";

interface RecentProject {
  path: string;
  name: string;
  last_used: string | null;
}

interface Props {
  scope: ScopeArg;
  onChange: (scope: ScopeArg) => void;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const day = 86400000;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / 3600000)} 小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
  return new Date(iso).toISOString().slice(0, 10);
}

export default function ScopeSelector({ scope, onChange }: Props) {
  const isGlobal = scope.kind === "global";
  const canPickDir = isTauriApp();
  const [open_, setOpen] = useState(false);
  const [recents, setRecents] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canPickDir) return;
    setLoading(true);
    api
      .listRecentProjects()
      .then(setRecents)
      .finally(() => setLoading(false));
  }, [canPickDir]);

  useEffect(() => {
    if (!open_) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open_]);

  async function pickDir() {
    if (!canPickDir) return;
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === "string") {
      onChange({ kind: "project", path: selected });
      setOpen(false);
    }
  }

  function pickRecent(p: RecentProject) {
    onChange({ kind: "project", path: p.path });
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 bg-app-bg rounded-lg p-1 border border-app-border">
        <button
          onClick={() => onChange({ kind: "global" })}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            isGlobal
              ? "bg-app-accent text-white font-medium"
              : "text-app-secondary hover:text-app-text"
          }`}
        >
          全局
        </button>
        <button
          onClick={() => {
            if (isGlobal) onChange({ kind: "project", path: "" });
            setOpen(true);
          }}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            !isGlobal
              ? "bg-app-accent text-white font-medium"
              : "text-app-secondary hover:text-app-text"
          }`}
        >
          项目
        </button>
      </div>

      {!isGlobal && (
        <div ref={ref} className="relative">
          {canPickDir ? (
            <button
              onClick={() => setOpen((v) => !v)}
              className="px-3 py-1.5 text-xs bg-app-card hover:bg-app-cardHover text-app-secondary hover:text-app-text border border-app-border rounded-lg transition-colors max-w-72 truncate flex items-center gap-1.5"
              title={scope.kind === "project" ? scope.path : ""}
            >
              <span className="truncate">
                {scope.kind === "project" && scope.path ? scope.path : "选择项目…"}
              </span>
              <span className="text-app-muted text-[10px]">▾</span>
            </button>
          ) : (
            <span className="text-xs text-app-muted italic">仅桌面端可选</span>
          )}

          {open_ && canPickDir && (
            <div className="absolute top-full left-0 mt-1.5 w-[420px] max-h-96 overflow-y-auto bg-app-card border border-app-border rounded-xl shadow-2xl z-30">
              <div className="px-4 py-2.5 border-b border-app-border flex items-center justify-between">
                <span className="text-[10px] uppercase text-app-muted tracking-wide">
                  Claude Code 最近项目
                </span>
                <button
                  onClick={pickDir}
                  className="text-xs px-2 py-0.5 bg-app-surface border border-app-border rounded hover:border-app-accent/40 hover:text-app-text text-app-secondary transition-colors"
                >
                  浏览…
                </button>
              </div>

              {loading && (
                <div className="px-4 py-6 text-center text-xs text-app-muted">加载中…</div>
              )}

              {!loading && recents.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-app-muted">
                  无历史项目，点上方「浏览…」选择目录
                </div>
              )}

              {!loading && recents.length > 0 && (
                <div className="py-1">
                  {recents.map((p) => {
                    const active = scope.kind === "project" && scope.path === p.path;
                    return (
                      <button
                        key={p.path}
                        onClick={() => pickRecent(p)}
                        className={`w-full text-left px-4 py-2 transition-colors ${
                          active ? "bg-app-cardActive" : "hover:bg-app-cardHover"
                        }`}
                      >
                        <div className="text-sm text-app-text font-medium truncate">{p.name}</div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className="text-[10px] text-app-muted font-mono truncate">
                            {p.path}
                          </span>
                          <span className="text-[10px] text-app-muted shrink-0">
                            {formatRelative(p.last_used)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
