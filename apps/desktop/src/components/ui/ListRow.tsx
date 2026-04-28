import type { HTMLAttributes } from "react";

export function ListRow({
  active,
  selected,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { active?: boolean; selected?: boolean }) {
  const state = active
    ? "bg-app-rowActive border-app-green/35"
    : selected
      ? "bg-app-panel border-app-accent/35"
      : "bg-app-row border-app-borderSubtle hover:bg-app-rowHover";

  return (
    <div
      className={`relative rounded-control border transition-colors ${state} ${active ? "before:absolute before:bottom-1 before:left-0 before:top-1 before:w-0.5 before:rounded-full before:bg-app-green" : ""} ${className}`}
      {...props}
    />
  );
}
