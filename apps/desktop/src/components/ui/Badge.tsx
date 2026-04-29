import type { ReactNode } from "react";

type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "active";

const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-card text-ink-2 border-hairline",
  info: "bg-accent-soft text-accent border-accent/25",
  success: "bg-green-soft text-green border-green/30",
  warning: "bg-amber-soft text-amber border-amber/30",
  danger: "bg-red-soft text-red border-red/30",
  active: "bg-green-soft text-green border-green/30",
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
