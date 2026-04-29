// src/components/ui/SectionLabel.tsx
import type { ReactNode, CSSProperties } from "react";

export function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <span className="section-label" style={style}>{children}</span>;
}
