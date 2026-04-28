import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export function SidebarItem({
  to,
  label,
  icon,
  end,
}: {
  to: string;
  label: string;
  icon?: ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex h-8 items-center gap-2 rounded-control px-2.5 text-sm transition-colors ${
          isActive
            ? "bg-app-accent text-white"
            : "text-app-secondary hover:bg-app-rowHover hover:text-app-text"
        }`
      }
    >
      {icon && <span className="flex h-4 w-4 items-center justify-center">{icon}</span>}
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
