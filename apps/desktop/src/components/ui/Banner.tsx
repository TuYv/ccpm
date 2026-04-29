// src/components/ui/Banner.tsx
import type { ReactNode } from "react";

export type BannerTone = "amber" | "accent" | "green" | "red";

export function Banner({
  tone, children, lead, dot = false, actions, onClick,
}: {
  tone: BannerTone;
  children: ReactNode;
  lead?: ReactNode;
  dot?: boolean;
  actions?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className={`banner ${tone}`}
      style={{ alignItems: "center", cursor: onClick ? "pointer" : undefined }}
      onClick={onClick}
    >
      {dot && <span className={`dot ${tone}`} style={{ marginTop: 6 }} />}
      <div style={{ flex: 1 }}>
        {lead && <span className="lead" style={{ marginRight: 8 }}>{lead}</span>}
        {children}
      </div>
      {actions}
    </div>
  );
}
