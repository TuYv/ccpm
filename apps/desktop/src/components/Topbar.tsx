// src/components/Topbar.tsx
import type { ReactNode } from "react";
import { useCmdkStore } from "../stores/cmdk";

export default function Topbar({
  title,
  crumb,
  actions,
  search = true,
}: {
  title: ReactNode;
  crumb?: ReactNode;
  actions?: ReactNode;
  search?: boolean;
}) {
  const setOpen = useCmdkStore((s) => s.setOpen);
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {crumb && <div className="crumb" style={{ marginTop: 2 }}>{crumb}</div>}
      </div>
      <div className="spacer" />
      {search && (
        <button
          type="button"
          className="topbar-search"
          onClick={() => setOpen(true)}
          style={{ border: 0, background: "var(--card)", textAlign: "left" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <span style={{ flex: 1, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            搜索 recipes / presets / skills…
          </span>
          <kbd>⌘K</kbd>
        </button>
      )}
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
          {actions}
        </div>
      )}
    </div>
  );
}
