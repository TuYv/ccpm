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
      {label && <span className="block text-xs font-medium text-ink-2">{label}</span>}
      {children}
      {error ? (
        <span className="block text-[11px] text-red">{error}</span>
      ) : helper ? (
        <span className="block text-[11px] text-ink-3">{helper}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-control border border-hairline bg-surface px-3 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent ${className}`}
      {...props}
    />
  );
}

export function TextArea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-control border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent ${className}`}
      {...props}
    />
  );
}

export function SelectInput({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-control border border-hairline bg-surface px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-accent ${className}`}
      {...props}
    />
  );
}
