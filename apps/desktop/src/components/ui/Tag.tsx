// src/components/ui/Tag.tsx
import type { ReactNode, MouseEventHandler } from "react";

export function Tag({
  children, selected = false, onClick, className = "",
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}) {
  const Cmp = onClick ? "button" : "span";
  const selStyle = selected
    ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" }
    : undefined;
  return (
    <Cmp
      onClick={onClick}
      className={`tag ${className}`.trim()}
      style={selStyle}
      type={onClick ? "button" : undefined}
    >
      {children}
    </Cmp>
  );
}
