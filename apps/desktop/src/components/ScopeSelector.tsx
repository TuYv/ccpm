import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useRef, useState } from "react";
import { api, isTauriApp } from "../api/claudePreset";
import { useScopeStore } from "../stores/scope";
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

const DROPDOWN_MAX_HEIGHT = 384; // matches max-h-96
const DROPDOWN_WIDTH = 420;

export { ScopeSelector };

export function GlobalScopeSelector() {
  const scope = useScopeStore((s) => s.scope);
  const setScope = useScopeStore((s) => s.setScope);
  return <ScopeSelector scope={scope} onChange={setScope} />;
}

function ScopeSelector({ scope, onChange }: Props) {
  const isGlobal = scope.kind === "global";
  const canPickDir = isTauriApp();
  const [open_, setOpen] = useState(false);
  const [recents, setRecents] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: "down" | "up" }>({ top: 0, left: 0, placement: "down" });
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canPickDir) return;
    setLoading(true);
    api
      .listRecentProjects()
      .then(setRecents)
      .finally(() => setLoading(false));
  }, [canPickDir]);

  function recalcPosition() {
    const btn = triggerRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const spaceAbove = r.top - 8;
    const placement: "down" | "up" =
      spaceBelow >= DROPDOWN_MAX_HEIGHT || spaceBelow >= spaceAbove ? "down" : "up";
    let left = r.left;
    if (left + DROPDOWN_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - DROPDOWN_WIDTH - 8;
    }
    if (left < 8) left = 8;
    const top = placement === "down" ? r.bottom + 6 : r.top - 6;
    setCoords({ top, left, placement });
  }

  useEffect(() => {
    if (!open_) return;
    recalcPosition();
    const onResize = () => recalcPosition();
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current && !ref.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
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
              ref={triggerRef}
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
            <div
              ref={popoverRef}
              className="fixed w-[420px] max-h-96 overflow-y-auto bg-app-card border border-app-border rounded-xl shadow-2xl z-50"
              style={{
                top: coords.placement === "down" ? coords.top : undefined,
                bottom: coords.placement === "up" ? window.innerHeight - coords.top : undefined,
                left: coords.left,
              }}
            >
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

export default ScopeSelector;
