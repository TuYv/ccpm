import type { HTMLAttributes } from "react";

export function ListRow({
  active,
  selected,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { active?: boolean; selected?: boolean }) {
  const state = active
    ? "bg-accent-soft border-green/35"
    : selected
      ? "bg-card border-accent/35"
      : "bg-card border-hairline hover:bg-card-2";

  return (
    <div
      className={`relative rounded-control border transition-colors ${state} ${active ? "before:absolute before:bottom-1 before:left-0 before:top-1 before:w-0.5 before:rounded-full before:bg-green" : ""} ${className}`}
      {...props}
    />
  );
}
