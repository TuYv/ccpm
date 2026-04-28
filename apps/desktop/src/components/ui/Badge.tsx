import type { ReactNode } from "react";

type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "active";

const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-app-panel text-app-secondary border-app-border",
  info: "bg-app-accent/10 text-app-accent border-app-accent/25",
  success: "bg-app-green/10 text-app-green border-app-green/30",
  warning: "bg-app-orange/10 text-app-orange border-app-orange/30",
  danger: "bg-app-red/10 text-app-red border-app-red/30",
  active: "bg-app-green/10 text-app-green border-app-green/30",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-4 ${toneClass[tone]} ${className}`}>
      {children}
    </span>
  );
}
