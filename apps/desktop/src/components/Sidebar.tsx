// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useScopeStore } from "../stores/scope";
import ScopeSelector from "./ScopeSelector";

interface NavCounts {
  recipes?: number;
  presets?: number;
  skills?: number;
  mcps?: number;
  installed?: number;
  backups?: number;
}

interface NavItemDef {
  to: string;
  label: string;
  icon: ReactNode;
}

const RecipeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2.5h6.5L13 5v8.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z" />
    <path d="M10 2.5V5h2.5" />
    <path d="M5.5 8.5h5M5.5 11h3" />
  </svg>
);
const PresetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" />
    <path d="M2.5 6.5h11M6.5 13.5v-7" />
  </svg>
);
const SkillIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1.5l1.7 3.6 4 .5-2.9 2.7.8 4-3.6-2-3.6 2 .8-4L2.3 5.6l4-.5L8 1.5Z" />
  </svg>
);
const McpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="4" cy="4" r="1.5" />
    <circle cx="12" cy="4" r="1.5" />
    <circle cx="8" cy="12" r="1.5" />
    <path d="M4 5.5v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2M8 9.5v1" />
  </svg>
);
const InstalledIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 9.5l5.5 4 5.5-4M2.5 6.5L8 10.5l5.5-4L8 2.5 2.5 6.5Z" />
  </svg>
);
const BackupIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9" />
    <path d="M2 2.5v3h3M8 5v3l2 1.5" />
  </svg>
);
const ConfigIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1.5V3M8 13v1.5M14.5 8H13M3 8H1.5M12.36 3.64l-1.06 1.06M4.7 11.3l-1.06 1.06M12.36 12.36l-1.06-1.06M4.7 4.7 3.64 3.64" />
  </svg>
);

const LIBRARY = [
  { to: "/recipes", label: "配方", icon: <RecipeIcon />, countKey: "recipes" as const },
  { to: "/presets", label: "Presets", icon: <PresetIcon />, countKey: "presets" as const },
  { to: "/skills", label: "Skills", icon: <SkillIcon />, countKey: "skills" as const },
  { to: "/mcp", label: "MCP", icon: <McpIcon />, countKey: "mcps" as const },
];

const STATE_NAV = [
  { to: "/installed", label: "已安装", icon: <InstalledIcon />, countKey: "installed" as const },
  { to: "/backups", label: "备份", icon: <BackupIcon />, countKey: "backups" as const },
  { to: "/claude-settings", label: "Claude 配置", icon: <ConfigIcon />, countKey: undefined },
];

function NavRow({ item, count, end = false }: { item: NavItemDef; count?: number; end?: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={end}
      className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      style={{ textDecoration: "none" }}
    >
      {item.icon}
      <span>{item.label}</span>
      {count != null && <span className="count">{count}</span>}
    </NavLink>
  );
}

export default function Sidebar({ counts }: { counts: NavCounts }) {
  const scope = useScopeStore((s) => s.scope);
  const setScope = useScopeStore((s) => s.setScope);
  return (
    <aside className="nav" style={{ width: 220, height: "100%" }}>
      <div className="nav-brand">
        <div className="nav-mark accent">cc</div>
        <div className="nav-name">
          ccpm
          <span className="sub">preset manager</span>
        </div>
      </div>
      <div className="nav-section">Library</div>
      {LIBRARY.map((it) => (
        <NavRow key={it.to} item={it} count={counts[it.countKey]} end={it.to === "/recipes"} />
      ))}
      <div className="nav-section">State</div>
      {STATE_NAV.map((it) => (
        <NavRow
          key={it.to}
          item={it}
          count={it.countKey ? counts[it.countKey] : undefined}
        />
      ))}
      <div className="nav-foot">
        <span className="dot accent" style={{ marginTop: 2 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="scope-tag">Active scope</div>
          <ScopeSelector scope={scope} onChange={setScope} />
        </div>
      </div>
    </aside>
  );
}
