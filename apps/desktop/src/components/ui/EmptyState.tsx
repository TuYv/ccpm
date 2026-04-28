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
      <div className="text-sm font-medium text-app-secondary">{title}</div>
      {description && <div className="max-w-sm text-xs text-app-muted">{description}</div>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
