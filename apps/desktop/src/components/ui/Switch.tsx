// src/components/ui/Switch.tsx
export function Switch({
  checked, onChange, ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`switch ${checked ? "on" : ""}`.trim()}
      style={{ border: 0, padding: 2, cursor: "pointer" }}
    />
  );
}
