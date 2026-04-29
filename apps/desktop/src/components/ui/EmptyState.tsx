import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="text-sm font-medium text-ink-2">{title}</div>
      {description && <div className="max-w-sm text-xs text-ink-3">{description}</div>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
