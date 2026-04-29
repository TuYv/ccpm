// src/components/ui/Chip.tsx
import type { ReactNode } from "react";

export type ChipTone = "neutral" | "accent" | "green" | "amber" | "red" | "blue";

export function Chip({
  children, tone = "neutral", dot = false, className = "",
}: {
  children: ReactNode;
  tone?: ChipTone;
  dot?: boolean;
  className?: string;
}) {
  const toneClass = tone === "neutral" ? "" : tone;
  return (
    <span className={`chip ${toneClass} ${className}`.trim()}>
      {dot && <span className={`dot ${tone === "neutral" ? "" : tone}`.trim()} />}
      {children}
    </span>
  );
}
