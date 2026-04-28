import type { ReactNode } from "react";

export function Toolbar({
  title,
  subtitle,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-app-border bg-app-bg px-4">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold text-app-text">{title}</h1>
        {subtitle && <div className="truncate text-[11px] text-app-muted">{subtitle}</div>}
      </div>
      {left && <div className="flex min-w-0 flex-1 items-center gap-2">{left}</div>}
      {!left && <div className="flex-1" />}
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}
