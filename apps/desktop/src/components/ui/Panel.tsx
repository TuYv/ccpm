import type { HTMLAttributes } from "react";

export function Panel({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-panel border border-app-border bg-app-panel ${className}`} {...props} />;
}
