import type { HTMLAttributes } from "react";

export function Panel({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-panel border border-hairline bg-card ${className}`} {...props} />;
}
