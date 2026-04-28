import type { ReactNode } from "react";

interface EditorSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function EditorSection({ title, description, children }: EditorSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-app-secondary">
          {title}
        </h2>
        {description && <p className="mt-1 text-xs text-app-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
