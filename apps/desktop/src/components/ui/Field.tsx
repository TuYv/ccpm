import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  helper,
  error,
  children,
}: {
  label?: string;
  helper?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="block text-xs font-medium text-app-secondary">{label}</span>}
      {children}
      {error ? (
        <span className="block text-[11px] text-app-red">{error}</span>
      ) : helper ? (
        <span className="block text-[11px] text-app-muted">{helper}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-control border border-app-border bg-app-surface px-3 py-1.5 text-sm text-app-text outline-none transition-colors placeholder:text-app-muted focus:border-app-focus ${className}`}
      {...props}
    />
  );
}

export function TextArea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-control border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text outline-none transition-colors placeholder:text-app-muted focus:border-app-focus ${className}`}
      {...props}
    />
  );
}

export function SelectInput({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-control border border-app-border bg-app-surface px-3 py-1.5 text-sm text-app-text outline-none transition-colors focus:border-app-focus ${className}`}
      {...props}
    />
  );
}
