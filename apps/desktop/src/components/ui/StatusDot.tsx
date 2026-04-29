type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClass: Record<StatusTone, string> = {
  neutral: "bg-ink-3",
  success: "bg-green",
  warning: "bg-amber",
  danger: "bg-red",
  info: "bg-accent",
};

export function StatusDot({ tone = "neutral" }: { tone?: StatusTone }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${toneClass[tone]}`} />;
}
